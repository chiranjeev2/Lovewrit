import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isRequestAdminAuthorized } from "@/lib/admin-auth";
import { sanitizeGuestName, sanitizeText } from "@/lib/sanitize";
import {
  checkPayloadSize,
  enforceRateLimit,
  validateGuestbookInput,
  safeErrorResponse,
  safeServerErrorResponse,
} from "@/lib/api-safety";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();
    const token = searchParams.get("token")?.trim();
    const format = searchParams.get("format");

    if (!slug) {
      return safeErrorResponse("Missing slug parameter", 400);
    }

    const order = await db.order.findUnique({
      where: { slug },
      include: { pageData: true },
    });

    if (!order || !order.pageData) {
      return safeErrorResponse("Page not found", 404);
    }

    const isMasterAdmin = isRequestAdminAuthorized(req).authorized;
    const isCreator = Boolean(
      (token && order.adminToken && token === order.adminToken) || isMasterAdmin
    );

    const entries = await db.guestbookEntry.findMany({
      where: {
        pageDataId: order.pageData.id,
        ...(isCreator ? {} : { status: "APPROVED" }),
      },
      orderBy: { createdAt: "desc" },
    });

    const approvedEntries = entries.filter((e) => e.status === "APPROVED");
    const validEntries = isCreator ? entries.filter((e) => e.status !== "FLAGGED") : entries;

    const stats = {
      attendingCount: validEntries.filter((e) => e.attendance === "ATTENDING").length,
      headcountTotal: validEntries
        .filter((e) => e.attendance === "ATTENDING")
        .reduce((sum, e) => sum + (e.headcount || 1), 0),
      regretsCount: validEntries.filter((e) => e.attendance === "REGRETS").length,
      totalResponses: validEntries.length,
    };

    if (format === "csv" && isCreator) {
      const csvHeader = "Date,Guest Name,RSVP Status,Headcount,Message,Status";
      const csvRows = entries.map((entry) => {
        const dateStr = new Date(entry.createdAt).toISOString().split("T")[0];
        const safeName = `"${entry.authorName.replace(/"/g, '""')}"`;
        const safeMsg = `"${entry.message.replace(/"/g, '""')}"`;
        const rsvpStatus = entry.attendance || "ATTENDING";
        const count = entry.headcount || 1;
        const status = entry.status;
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
    console.error("Guestbook fetch note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const sizeErr = checkPayloadSize(req, 200 * 1024);
    if (sizeErr) return sizeErr;

    const rateLimit = await enforceRateLimit(req, "GUESTBOOK_POST", 15, 60);
    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response;
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return safeErrorResponse("Malformed JSON in request body", 400);
    }

    const validation = validateGuestbookInput(rawBody);
    if (!validation.success || !validation.data) {
      return safeErrorResponse(validation.error || "Invalid guestbook entry data", 400);
    }

    const { slug, authorName, message, attendance, headcount } = validation.data;

    const order = await db.order.findUnique({
      where: { slug },
      include: { pageData: true },
    });

    if (!order || !order.pageData) {
      return safeErrorResponse("Page not found", 404);
    }

    const isMemorial = order.pageData.occasion === "memorial" || order.templateId === "sacred-tribute" || order.templateId === "memorial-candle" || order.templateId === "condolence-letter";
    const requireApproval = Boolean(order.pageData.requireGuestbookApproval || isMemorial);
    const initialStatus = requireApproval ? "PENDING" : "APPROVED";

    const cleanAuthor = sanitizeGuestName(authorName, 60);
    const cleanMessage = sanitizeText(message, 1500);

    if (!cleanAuthor || !cleanMessage) {
      return safeErrorResponse("Valid name and message are required", 400);
    }

    const entry = await db.guestbookEntry.create({
      data: {
        pageDataId: order.pageData.id,
        authorName: cleanAuthor,
        message: cleanMessage,
        attendance,
        headcount: attendance === "ATTENDING" ? headcount : 1,
        status: initialStatus,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
      isPending: initialStatus === "PENDING",
    });
  } catch (err: unknown) {
    console.error("Guestbook submission note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}

// Creator moderation (Approve / Flag / Delete)
export async function PATCH(req: NextRequest) {
  try {
    const sizeErr = checkPayloadSize(req, 50 * 1024);
    if (sizeErr) return sizeErr;

    const rateLimit = await enforceRateLimit(req, "GUESTBOOK_MOD", 20, 60);
    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response;
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return safeErrorResponse("Malformed JSON in request body", 400);
    }

    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    const action = typeof body.action === "string" ? body.action.trim() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!entryId || !action) {
      return safeErrorResponse("Missing entryId or action", 400);
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
    const isMasterAdmin = isRequestAdminAuthorized(req).authorized;

    const entry = await db.guestbookEntry.findUnique({
      where: { id: entryId },
      include: { pageData: { include: { order: true } } },
    });

    if (!entry) {
      return safeErrorResponse("Entry not found", 404);
    }

    const isCreator = Boolean(
      token && entry.pageData.order.adminToken && token === entry.pageData.order.adminToken
    );

    if (!isMasterAdmin && !isCreator) {
      return safeErrorResponse("Unauthorized", 403);
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

    return safeErrorResponse("Invalid moderation action", 400);
  } catch (err: unknown) {
    console.error("Guestbook moderation note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}
