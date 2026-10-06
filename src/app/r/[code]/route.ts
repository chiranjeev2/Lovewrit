import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/base-url";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const cleanCode = code ? code.trim().toUpperCase() : "";

  const baseUrl = getBaseUrl();
  const targetUrl = new URL("/", baseUrl);
  if (cleanCode) {
    targetUrl.searchParams.set("ref", cleanCode);
  }

  const response = NextResponse.redirect(targetUrl.toString(), 302);

  if (cleanCode) {
    // Set 30-day attribution cookie
    response.cookies.set("lovewrit_referral_code", cleanCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Accessible to client-side checkout
      sameSite: "lax",
    });
  }

  return response;
}
