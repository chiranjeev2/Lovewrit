import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isRequestAdminAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = isRequestAdminAuthorized(req);
    if (auth.serviceUnavailable) {
      return NextResponse.json(
        { error: "Admin service unavailable. ADMIN_MASTER_KEY is not configured." },
        { status: 503 }
      );
    }
    if (!auth.authorized) {
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
