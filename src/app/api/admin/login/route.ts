import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isServerAdminKeyConfigured,
  verifyAdminMasterKey,
  generateAdminSessionToken,
  checkAdminLoginRateLimit,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Fail closed if ADMIN_MASTER_KEY is missing, <20 chars, or blacklisted
    if (!isServerAdminKeyConfigured()) {
      return NextResponse.json(
        { error: "Admin access unavailable. System master key is not configured or does not meet security requirements." },
        { status: 503 }
      );
    }

    // 2. Rate limit attempts by IP and device
    const rateLimit = await checkAdminLoginRateLimit(req);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Validate master key input
    const body = await req.json().catch(() => ({}));
    const { masterKey } = body;

    if (!masterKey || typeof masterKey !== "string" || !verifyAdminMasterKey(masterKey)) {
      return NextResponse.json({ error: "Invalid master key" }, { status: 401 });
    }

    // 4. Generate signed session token and set httpOnly strict cookie
    const token = generateAdminSessionToken();
    const response = NextResponse.json({ success: true, message: "Admin access granted" });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2-hour session
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Signed out" });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
