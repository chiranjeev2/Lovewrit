import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_OCCASIONS, OccasionEvent, getActiveUpcomingOccasion } from "@/lib/occasion-calendar";

export async function GET(req: NextRequest) {
  try {
    const setting = await db.platformSetting.findUnique({
      where: { key: "occasion_calendar" },
    });

    let occasions: OccasionEvent[] = DEFAULT_OCCASIONS;
    if (setting?.value) {
      try {
        occasions = JSON.parse(setting.value);
      } catch (e) {
        console.warn("Could not parse occasion_calendar setting, using defaults:", e);
      }
    }

    const activeUpcoming = getActiveUpcomingOccasion(occasions);
    return NextResponse.json({ occasions, activeUpcoming });
  } catch (err: unknown) {
    console.error("Failed to load occasion calendar:", err);
    return NextResponse.json({ occasions: DEFAULT_OCCASIONS, activeUpcoming: getActiveUpcomingOccasion() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { masterKey, occasions } = body;

    // Verify admin master key
    if (masterKey !== "memoir_master_founder_secret_2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(occasions)) {
      return NextResponse.json({ error: "Occasions must be an array" }, { status: 400 });
    }

    // Upsert into platform settings
    await db.platformSetting.upsert({
      where: { key: "occasion_calendar" },
      update: { value: JSON.stringify(occasions) },
      create: { key: "occasion_calendar", value: JSON.stringify(occasions) },
    });

    return NextResponse.json({
      success: true,
      message: "Occasion calendar updated successfully",
      activeUpcoming: getActiveUpcomingOccasion(occasions),
    });
  } catch (err: unknown) {
    console.error("Failed to update occasion calendar:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update occasion calendar" },
      { status: 500 }
    );
  }
}
