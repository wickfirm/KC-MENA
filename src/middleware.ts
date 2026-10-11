import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { canViewPath } from "@/lib/permissions";

// Protect the entire /admin area. /admin/login stays public.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    // Already signed in? Skip straight to the dashboard.
    const token = req.cookies.get("kc_session")?.value;
    if (token && (await verifySessionToken(token))) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  const token = req.cookies.get("kc_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  // Fast reject only (the token role can be stale); pages and route handlers re-check against the database.
  if (!canViewPath(session.role, pathname)) return NextResponse.redirect(new URL("/admin?denied=1", req.url));
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
