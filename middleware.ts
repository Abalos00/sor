import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = ["next-auth.session-token", "__Secure-next-auth.session-token"];

export function middleware(req: NextRequest) {
  const hasNextAuthSession = SESSION_COOKIE_NAMES.some((name) => Boolean(req.cookies.get(name)));
  if (!hasNextAuthSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("reason", "session_required");
    return NextResponse.redirect(loginUrl);
  }

  const rememberCookie = req.cookies.get("sor_session");
  if (!rememberCookie) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("reason", "session_required");
    const response = NextResponse.redirect(loginUrl);
    SESSION_COOKIE_NAMES.forEach((name) => {
      if (req.cookies.get(name)) {
        response.cookies.set({
          name,
          value: "",
          path: "/",
          expires: new Date(0),
        });
      }
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/support/:path*",
    "/api/devices/:path*",
    "/api/jobs/:path*",
    "/api/me/:path*",
    "/api/org/:path*",
    "/api/profiles/:path*",
    "/api/reports/:path*",
    "/api/tools/:path*",
    "/api/users/:path*",
  ],
};
