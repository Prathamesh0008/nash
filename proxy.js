import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment");
}
const secret = new TextEncoder().encode(JWT_SECRET);

const authPages = ["/auth/login", "/auth/signup", "/admin/login", "/login", "/register"];

const protectedPrefixes = [
  "/booking",
  "/orders",
  "/wallet",
  "/notifications",
  "/messages",
  "/settings",
  "/profile",
  "/user",
  "/addresses",
  "/support",
  "/worker",
  "/admin",
  "/chat",
];

function matchPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function matchAny(pathname, prefixes) {
  return prefixes.some((prefix) => matchPrefix(pathname, prefix));
}

function roleHome(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "worker") return "/worker/dashboard";
  return "/services";
}

const adminAllowedPrefixes = ["/admin", "/legal", "/support", "/notifications"];
const workerAllowedPrefixes = ["/worker", "/chat", "/legal", "/support", "/notifications"];

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth")?.value;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  let payload = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch {
      payload = null;
    }
  }

  if (authPages.some((p) => matchPrefix(pathname, p))) {
    if (!payload) return NextResponse.next();
    return NextResponse.redirect(new URL(roleHome(payload.role), req.url));
  }

  if (!token) {
    if (!matchAny(pathname, protectedPrefixes)) return NextResponse.next();
    const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/auth/login";
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  if (!payload) {
    if (!matchAny(pathname, protectedPrefixes)) return NextResponse.next();
    const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/auth/login";
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  if (matchPrefix(pathname, "/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL(roleHome(payload.role), req.url));
  }

  if (matchPrefix(pathname, "/worker") && payload.role !== "worker") {
    return NextResponse.redirect(new URL(roleHome(payload.role), req.url));
  }

  if (payload.role === "admin" && !matchAny(pathname, adminAllowedPrefixes)) {
    if (!matchPrefix(pathname, "/_next") && pathname !== "/favicon.ico") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  if (payload.role === "worker" && !matchAny(pathname, workerAllowedPrefixes)) {
    if (!matchPrefix(pathname, "/_next") && pathname !== "/favicon.ico") {
      return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
