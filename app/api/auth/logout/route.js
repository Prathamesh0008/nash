import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { REFRESH_COOKIE_NAME } from "@/lib/auth";
import { clearSession, revokeRefreshToken } from "@/lib/session";

export async function POST() {
  await dbConnect();
  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  await revokeRefreshToken(refreshToken);
  const res = NextResponse.json({ ok: true });
  return clearSession(res);
}