import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

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
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
