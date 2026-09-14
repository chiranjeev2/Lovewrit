import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const adminSession = req.cookies.get("memoir_admin_session")?.value;
    const headerKey = req.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_MASTER_KEY || "memoir_master_founder_secret_2026";

    const isAuthorized =
      adminSession === "authenticated" ||
      (headerKey && headerKey === expectedKey);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cardData: true,
        pageData: true,
      },
    });

    // Compute simple founder analytics
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.status === "PAID").length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

    const revenueByCurrency: Record<string, number> = {
      INR: 0,
      USD: 0,
      EUR: 0,
      GBP: 0,
    };

    orders.forEach((o) => {
      if (o.status === "PAID") {
        const curr = o.currency || "USD";
        revenueByCurrency[curr] = (revenueByCurrency[curr] || 0) + o.amountTotal;
      }
    });

    return NextResponse.json({
      orders,
      stats: {
        totalOrders,
        paidOrders,
        pendingOrders,
        revenueByCurrency,
      },
    });
  } catch (err: unknown) {
    console.error("Admin orders fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load orders" },
      { status: 500 }
    );
  }
}

