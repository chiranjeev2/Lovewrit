import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "memoir_admin_session";

export async function POST(req: NextRequest) {
  try {
    const { masterKey } = await req.json();
    const expectedKey = process.env.ADMIN_MASTER_KEY || "memoir_master_founder_secret_2026";

    if (!masterKey || masterKey !== expectedKey) {
      return NextResponse.json({ error: "Invalid founder master key" }, { status: 401 });
    }

    // Set HTTP-only admin cookie
    const response = NextResponse.json({ success: true, message: "Founder access granted" });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Signed out" });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
