import { NextRequest, NextResponse } from "next/server";
import { verifySsoToken, createSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/courseAccess";

/**
 * SSO handshake landing point. Base44's "My Courses" link (shown only
 * once AppSettings.online_learning_platform_enabled is on) redirects here
 * with a short-lived signed token. We verify it, establish our own
 * session cookie for the client it names, and send them on to the course
 * listing — entitlement itself is checked fresh on that page, not here.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const redirectTo = new URL("/online-learning", req.url);

  if (!token) {
    redirectTo.searchParams.set("error", "missing_token");
    return NextResponse.redirect(redirectTo);
  }

  const clientId = await verifySsoToken(token);
  if (!clientId) {
    redirectTo.searchParams.set("error", "invalid_or_expired_link");
    return NextResponse.redirect(redirectTo);
  }

  const sessionValue = await createSessionCookieValue(clientId);
  const response = NextResponse.redirect(redirectTo);
  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // Identity only, not an access grant — real entitlement is re-checked
    // live via checkCourseAccess on every protected page, so a long cookie
    // lifetime here is safe.
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
