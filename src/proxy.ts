import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isApiAuth = pathname.startsWith("/api/auth");

  if (isApiAuth || isPublic) {
    if (req.auth && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return;
  }

  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  // Run on all routes except static assets and Next internals
  matcher: ["/((?!_next/|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
