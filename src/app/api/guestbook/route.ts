import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const token = searchParams.get("token");
    const format = searchParams.get("format");

    if (!slug) {
      return NextResponse.json({ error: "Missing page slug" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { slug },
      include: { pageData: true },
    });

    if (!order || !order.pageData) {
      return NextResponse.json({ entries: [], stats: { attendingCount: 0, headcountTotal: 0, regretsCount: 0, totalResponses: 0 } });
    }

    const isCreator = Boolean(token && order.adminToken && token === order.adminToken);

    // If creator, fetch all entries (including PENDING). Otherwise, only APPROVED.
    const entries = await db.guestbookEntry.findMany({
      where: {
        pageDataId: order.pageData.id,
        ...(isCreator ? {} : { status: "APPROVED" }),
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute live RSVP stats (based on approved entries for public, or all non-flagged for creator)
    const validEntries = isCreator ? entries.filter((e) => e.status !== "FLAGGED") : entries;
    const attendingEntries = validEntries.filter((e) => e.attendance === "ATTENDING");
    const regretsEntries = validEntries.filter((e) => e.attendance === "REGRETS");
    const headcountTotal = attendingEntries.reduce((acc, curr) => acc + (curr.headcount || 1), 0);

    const stats = {
      attendingCount: attendingEntries.length,
      headcountTotal,
      regretsCount: regretsEntries.length,
      totalResponses: validEntries.length,
    };

    // Return CSV export if requested
    if (format === "csv") {
      const csvHeader = ["Date", "Guest Name", "RSVP Status", "Headcount", "Blessing / Note", "Status"].join(",");
      const csvRows = entries.map((e) => {
        const dateStr = new Date(e.createdAt).toISOString().split("T")[0];
        const safeName = `"${(e.authorName || "").replace(/"/g, '""')}"`;
        const rsvpStatus = e.attendance || "ATTENDING";
        const count = e.headcount || 1;
        const safeMsg = `"${(e.message || "").replace(/"/g, '""')}"`;
        const status = e.status;
        return [dateStr, safeName, rsvpStatus, count, safeMsg, status].join(",");
      });
      const csvContent = [csvHeader, ...csvRows].join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="lovewrit-rsvp-${slug}.csv"`,
        },
      });
    }

    return NextResponse.json({
      entries,
      stats,
      isCreator,
      requireApproval: order.pageData.requireGuestbookApproval,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, authorName, message, attendance = "ATTENDING", headcount = 1 } = body;

    if (!slug || !authorName || !message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { slug },
      include: { pageData: true },
    });

    if (!order || !order.pageData) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const requireApproval = order.pageData.requireGuestbookApproval;
    const initialStatus = requireApproval ? "PENDING" : "APPROVED";

    const parsedHeadcount = Math.max(1, Math.min(50, parseInt(String(headcount), 10) || 1));
    const validAttendance = ["ATTENDING", "REGRETS", "MESSAGE_ONLY"].includes(attendance)
      ? attendance
      : "ATTENDING";

    const entry = await db.guestbookEntry.create({
      data: {
        pageDataId: order.pageData.id,
        authorName: authorName.trim(),
        message: message.trim(),
        attendance: validAttendance,
        headcount: validAttendance === "ATTENDING" ? parsedHeadcount : 1,
        status: initialStatus,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
      isPending: initialStatus === "PENDING",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to post message" },
      { status: 500 }
    );
  }
}

// Creator moderation (Approve / Flag / Delete)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { entryId, action, token } = body; // action: "APPROVE" | "FLAG" | "DELETE"

    if (!entryId || !action) {
      return NextResponse.json({ error: "Missing entryId or action" }, { status: 400 });
    }

    if (action === "FLAG") {
      // Any public user can flag
      await db.guestbookEntry.update({
        where: { id: entryId },
        data: { status: "FLAGGED" },
      });
      return NextResponse.json({ success: true, message: "Entry flagged for review" });
    }

    // Approve / Delete requires token or admin session
    const adminSession =
      req.cookies.get("lovewrit_admin_session")?.value ||
      req.cookies.get("memoir_admin_session")?.value;
    const isMasterAdmin = adminSession === "authenticated";

    const entry = await db.guestbookEntry.findUnique({
      where: { id: entryId },
      include: { pageData: { include: { order: true } } },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const isCreator = Boolean(
      token && entry.pageData.order.adminToken && token === entry.pageData.order.adminToken
    );

    if (!isMasterAdmin && !isCreator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "APPROVE") {
      await db.guestbookEntry.update({
        where: { id: entryId },
        data: { status: "APPROVED" },
      });
      return NextResponse.json({ success: true, message: "Entry approved" });
    } else if (action === "DELETE") {
      await db.guestbookEntry.delete({
        where: { id: entryId },
      });
      return NextResponse.json({ success: true, message: "Entry deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Moderation action failed" },
      { status: 500 }
    );
  }
}

