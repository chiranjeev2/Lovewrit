import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import {
  PRICING_TIERS,
  CURRENCY_TO_REGION,
  CurrencyCode,
  RegionKey,
  ProductType,
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
      cardData,
      pageData,
    } = body;

    if (!productType || !templateId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Missing required order information" },
        { status: 400 }
      );
    }

    const currency: CurrencyCode = (requestedCurrency as CurrencyCode) || "USD";
    const region: RegionKey = CURRENCY_TO_REGION[currency] || "americas";
    const tier = PRICING_TIERS[region];

    const amountTotal =
      productType === "CARD" ? tier.cardPriceUnit : tier.pagePriceUnit;
    const displayPrice =
      productType === "CARD" ? tier.cardPrice : tier.pagePrice;

    // Generate unique human-friendly short slug for the finished card/page
    const slug = nanoid(10);

    // Save pending order and data in database
    const order = await db.order.create({
      data: {
        slug,
        customerEmail,
        customerName,
        productType,
        templateId,
        status: "PENDING",
        currency,
        amountTotal,
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
                  musicTrack: pageData.musicTrack || null,
                  musicType: pageData.musicType || "builtin",
                  isProposal: Boolean(pageData.isProposal),
                  colorTheme: pageData.colorTheme || "rose",
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

    // 1. Production / Live Stripe Mode
    if (isStripeConfigured() && stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Memoir ${productType === "CARD" ? "Digital Card" : "Interactive Couple Page"}`,
                description: `Occasion memory for ${
                  cardData?.recipientName || pageData?.recipientName || "Couples"
                }`,
              },
              unit_amount: amountTotal,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}`,
        cancel_url: `${origin}/create/${templateId}?canceled=true`,
        metadata: {
          orderId: order.id,
          slug,
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
      });
    }

    // 2. Dev / Simulation Mode (Immediate instant local testing)
    const simulatedSessionId = `sim_${order.id}`;
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: simulatedSessionId },
    });

    return NextResponse.json({
      checkoutUrl: `${origin}/checkout/success?session_id=${simulatedSessionId}&slug=${slug}`,
      isSimulated: true,
      orderId: order.id,
      slug,
      price: `${tier.symbol}${displayPrice}`,
    });
  } catch (err: unknown) {
    console.error("Checkout creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout initiation failed" },
      { status: 500 }
    );
  }
}

