import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RefreshToken from "@/models/RefreshToken";
import User from "@/models/User";
import { REFRESH_COOKIE_NAME, hashToken, issueTokensForUser, setAccessCookie, setRefreshCookie, verifyRefreshToken } from "@/lib/auth";

export async function POST(req) {
  await dbConnect();
  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return NextResponse.json({ ok: false, error: "No refresh token" }, { status: 401 });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload?.userId) {
    return NextResponse.json({ ok: false, error: "Invalid refresh token" }, { status: 401 });
  }

  const tokenHash = hashToken(refreshToken);
  const tokenDoc = await RefreshToken.findOne({
    userId: payload.userId,
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    return NextResponse.json({ ok: false, error: "Refresh token expired" }, { status: 401 });
  }

  const user = await User.findById(payload.userId);
  if (!user || (user.refreshVersion ?? 0) !== (payload.rv ?? 0)) {
    return NextResponse.json({ ok: false, error: "Session invalid" }, { status: 401 });
  }

  tokenDoc.revokedAt = new Date();
  await tokenDoc.save();

  const next = issueTokensForUser(user);
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(next.refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ip: req.headers.get("x-forwarded-for") || "",
    userAgent: req.headers.get("user-agent") || "",
  });

  const res = NextResponse.json({ ok: true });
  setAccessCookie(res, next.accessToken);
  setRefreshCookie(res, next.refreshToken);
  return res;
}