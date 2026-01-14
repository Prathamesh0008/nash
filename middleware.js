import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const protectedRoutes = [
  "/chat",
  "/admin",
  "/worker/dashboard",
  "/worker/onboarding",
  "/worker/inbox",
  "/user/inbox",
];

const authPages = ["/login", "/register", "/admin/login"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth")?.value;

  // ✅ allow static + api routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // block auth pages if logged in
  if (authPages.some((p) => pathname.startsWith(p))) {
    if (token) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // protect routes
  if (protectedRoutes.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);

      // admin only
      if (pathname.startsWith("/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // worker only
      if (
        (pathname.startsWith("/worker/dashboard") ||
          pathname.startsWith("/worker/onboarding") ||
          pathname.startsWith("/worker/inbox")) &&
        payload.role !== "worker"
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // user only
      if (pathname.startsWith("/user/inbox") && payload.role !== "user") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
