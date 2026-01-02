import { NextResponse } from "next/server";
import { decodeToken } from "./lib/auth-edge";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // 🔒 Worker routes
  if (pathname.startsWith("/worker")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const decoded = decodeToken(token);

    if (!decoded || decoded.role !== "worker") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  // 🔒 Customer profile
  if (pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/worker/:path*", "/profile/:path*"],
};
