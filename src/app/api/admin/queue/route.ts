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

    // Fetch custom & rush orders
    const queueOrders = await db.order.findMany({
      where: {
        tier: { in: ["CUSTOM", "RUSH"] },
      },
      orderBy: [
        { tier: "desc" }, // RUSH first
        { createdAt: "desc" },
      ],
      include: {
        cardData: true,
        pageData: true,
      },
    });

    // Check platform setting for rush availability
    const rushSetting = await db.platformSetting.findUnique({
      where: { key: "rush_available" },
    });
    const isRushAvailable = rushSetting ? rushSetting.value === "true" : true;

    return NextResponse.json({
      orders: queueOrders,
      isRushAvailable,
      queueCount: queueOrders.filter((o) => o.founderStatus !== "COMPLETED").length,
      rushCount: queueOrders.filter(
        (o) => o.tier === "RUSH" && o.founderStatus !== "COMPLETED"
      ).length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load queue" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { action, orderId, founderStatus, founderAssignedLink, isRushAvailable } = body;

    // Toggle Rush availability
    if (action === "TOGGLE_RUSH") {
      await db.platformSetting.upsert({
        where: { key: "rush_available" },
        update: { value: String(isRushAvailable) },
        create: { key: "rush_available", value: String(isRushAvailable) },
      });
      return NextResponse.json({
        success: true,
        isRushAvailable,
        message: `Emergency Rush orders are now ${isRushAvailable ? "ACTIVE" : "PAUSED"}`,
      });
    }

    // Update order status in queue
    if (action === "UPDATE_ORDER" && orderId) {
      const updated = await db.order.update({
        where: { id: orderId },
        data: {
          ...(founderStatus ? { founderStatus } : {}),
          ...(founderAssignedLink !== undefined ? { founderAssignedLink } : {}),
        },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Queue action failed" },
      { status: 500 }
    );
  }
}
