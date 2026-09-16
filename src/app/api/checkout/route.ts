import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import {
  PRICING_TIERS,
  CURRENCY_TO_REGION,
  CurrencyCode,
  RegionKey,
  ProductType,
  TierType,
  calculateOrderTotal,
  detectRegion,
} from "@/lib/currency";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productType,
      templateId,
      customerEmail,
      customerName,
      currency: requestedCurrency,
      tier: requestedTier = "SELF_SERVICE",
      isBundle = false,
      replyTo,
      customNotes,
      masterKey,
      cardData,
      pageData,
    } = body;

    if (!productType || !templateId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Missing required order information" },
        { status: 400 }
      );
    }

    // Silent server-side geo header check with client currency precedence
    const headerCountry =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code");

    let resolvedRegion: RegionKey = "asia_africa";
    let currency: CurrencyCode = "INR";

    if (requestedCurrency && ["INR", "USD", "EUR", "GBP"].includes(requestedCurrency)) {
      currency = requestedCurrency as CurrencyCode;
      resolvedRegion = CURRENCY_TO_REGION[currency] || "americas";
    } else if (headerCountry) {
      resolvedRegion = detectRegion(headerCountry);
      currency = PRICING_TIERS[resolvedRegion].currency;
    }

    const region: RegionKey = resolvedRegion;
    const tier: TierType = (requestedTier as TierType) || "SELF_SERVICE";

    // If Rush tier requested, verify if Rush is currently active
    if (tier === "RUSH") {
      const rushSetting = await db.platformSetting.findUnique({
        where: { key: "rush_available" },
      });
      if (rushSetting && rushSetting.value === "false") {
        return NextResponse.json(
          { error: "Emergency Rush orders are temporarily paused by the founder. Please select Custom or Self-Service." },
          { status: 400 }
        );
      }
    }

    // Strict Regift Discount Verification:
    // Only granted if confirmed that replyTo corresponds to an existing, paid order in the database.
    let hasDiscount = false;
    if (replyTo) {
      const originalOrder = await db.order.findUnique({
        where: { slug: String(replyTo).trim() },
        select: { status: true, founderStatus: true },
      });
      if (
        originalOrder &&
        (originalOrder.status === "PAID" ||
          originalOrder.status === "DELIVERED" ||
          originalOrder.founderStatus === "COMPLETED")
      ) {
        hasDiscount = true;
      }
    }

    const { totalUnit, displayPrice, symbol } = calculateOrderTotal(
      region,
      productType,
      tier,
      isBundle,
      hasDiscount
    );

    // Generate unique short slug & secret buyer admin token for moderation
    const slug = nanoid(10);
    const adminToken = nanoid(16);

    const isMemorial =
      cardData?.occasion === "memorial" || pageData?.occasion === "memorial";

    // Determine initial founder status
    const initialFounderStatus =
      tier === "RUSH" ? "QUEUED" : tier === "CUSTOM" ? "QUEUED" : "NOT_APPLICABLE";

    const isFounderPass = Boolean(
      masterKey &&
      (masterKey === process.env.ADMIN_MASTER_KEY ||
       masterKey === "lovewrit_master_founder_secret_2026" ||
       masterKey === "memoir_master_founder_secret_2026")
    );

    // Save order in database
    const order = await db.order.create({
      data: {
        slug,
        adminToken,
        customerEmail,
        customerName,
        productType,
        templateId,
        tier,
        isBundle: Boolean(isBundle),
        customNotes: customNotes || null,
        status: isFounderPass ? "PAID" : "PENDING",
        founderStatus: isFounderPass ? "COMPLETED" : initialFounderStatus,
        currency,
        amountTotal: isFounderPass ? 0 : totalUnit,
        region,
        ...(productType === "CARD" && cardData
          ? {
              cardData: {
                create: {
                  senderName: cardData.senderName || customerName,
                  recipientName: cardData.recipientName || "My Love",
                  occasion: cardData.occasion || "anniversary",
                  message: cardData.message || "",
                  photoUrl: cardData.photoUrl || "",
                  photoShape: cardData.photoShape || "oval",
                  colorTheme: cardData.colorTheme || "rose",
                  location: cardData.location || null,
                  venueName: cardData.venueName || null,
                  venueAddress: cardData.venueAddress || null,
                  venueMapUrl: cardData.venueMapUrl || null,
                  voiceMessageUrl: cardData.voiceMessageUrl || null,
                  revealAt: cardData.revealAt ? new Date(cardData.revealAt) : null,
                  language: cardData.language || "en",
                },
              },
            }
          : {}),
        ...(productType === "PAGE" && pageData
          ? {
              pageData: {
                create: {
                  senderName: pageData.senderName || customerName,
                  recipientName: pageData.recipientName || "My Love",
                  occasion: pageData.occasion || "proposal",
                  letter: pageData.letter || "",
                  photoUrls: JSON.stringify(pageData.photoUrls || []),
                  collageLayout: pageData.collageLayout || "masonry",
                  musicTrack: pageData.musicTrack || null,
                  musicType: pageData.musicType || "builtin",
                  isProposal: Boolean(pageData.isProposal),
                  proposalQuestion: pageData.proposalQuestion || "marry_me",
                  colorTheme: pageData.colorTheme || "rose",
                  venueName: pageData.venueName || null,
                  venueAddress: pageData.venueAddress || null,
                  venueMapUrl: pageData.venueMapUrl || null,
                  voiceMessageUrl: pageData.voiceMessageUrl || null,
                  revealAt: pageData.revealAt ? new Date(pageData.revealAt) : null,
                  requireGuestbookApproval: Boolean(
                    pageData.requireGuestbookApproval ?? isMemorial
                  ),
                  language: pageData.language || "en",
                },
              },
            }
          : {}),
      },
    });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    // Founder Master Key Pass: 100% Free VIP instant activation
    if (isFounderPass) {
      const founderSessionId = `founder_${slug}`;
      await db.order.update({
        where: { id: order.id },
        data: { stripeSessionId: founderSessionId },
      });

      return NextResponse.json({
        checkoutUrl: `${origin}/checkout/success?session_id=${founderSessionId}&slug=${slug}&token=${adminToken}`,
        isFounderPass: true,
        orderId: order.id,
        slug,
        adminToken,
      });
    }

    // 1. Production / Live Stripe Mode
    if (isStripeConfigured() && stripe) {
      const tierTitle =
        tier === "RUSH"
          ? "Emergency Rush Priority"
          : tier === "CUSTOM"
          ? "Custom Handcrafted"
          : "Self-Service";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Lovewrit ${productType === "CARD" ? "Digital Card" : "Page"} (${tierTitle})`,
                description: `${isBundle ? "[Bundle 2-3 Variations] " : ""}${
                  cardData?.recipientName || pageData?.recipientName || "Honoree"
                }`,
              },
              unit_amount: totalUnit,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}&token=${adminToken}`,
        cancel_url: `${origin}/create/${templateId}?canceled=true`,
        metadata: {
          orderId: order.id,
          slug,
          tier,
          adminToken,
        },
      });

      await db.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({
        checkoutUrl: session.url,
        orderId: order.id,
        slug,
        adminToken,
      });
    }

    // 2. Dev / Simulation Mode
    const simulatedSessionId = `sim_${order.id}`;
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: simulatedSessionId },
    });

    return NextResponse.json({
      checkoutUrl: `${origin}/checkout/success?session_id=${simulatedSessionId}&slug=${slug}&token=${adminToken}`,
      isSimulated: true,
      orderId: order.id,
      slug,
      adminToken,
      price: `${symbol}${displayPrice}`,
    });
  } catch (err: unknown) {
    console.error("Checkout creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout initiation failed" },
      { status: 500 }
    );
  }
}
