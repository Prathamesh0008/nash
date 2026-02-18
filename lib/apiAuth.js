import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  hashToken,
  issueTokensForUser,
  setAccessCookie,
  setRefreshCookie,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth";

async function unauthorizedResponse() {
  return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
}

export async function getAuthUser({ allowRefresh = true } = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload?.userId) {
      return { user: payload, refreshedResponse: null };
    }
  }

  if (!allowRefresh) {
    return { user: null, refreshedResponse: null };
  }

  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return { user: null, refreshedResponse: null };
  }

  const refreshPayload = verifyRefreshToken(refreshToken);
  if (!refreshPayload?.userId) {
    return { user: null, refreshedResponse: null };
  }

  await dbConnect();
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({
    userId: refreshPayload.userId,
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!stored) {
    return { user: null, refreshedResponse: null };
  }

  const dbUser = await User.findById(refreshPayload.userId).lean();
  if (!dbUser || dbUser.status === "blocked") {
    return { user: null, refreshedResponse: null };
  }

  if ((dbUser.refreshVersion ?? 0) !== (refreshPayload.rv ?? 0)) {
    return { user: null, refreshedResponse: null };
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = issueTokensForUser(dbUser);

  // rotate refresh token
  await RefreshToken.updateOne({ _id: stored._id }, { $set: { revokedAt: new Date() } });
  await RefreshToken.create({
    userId: dbUser._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ip: (await headers()).get("x-forwarded-for") || "",
    userAgent: (await headers()).get("user-agent") || "",
  });

  const refreshedResponse = NextResponse.next();
  setAccessCookie(refreshedResponse, newAccessToken);
  setRefreshCookie(refreshedResponse, newRefreshToken);

  return {
    user: {
      userId: dbUser._id.toString(),
      role: dbUser.role,
      rv: dbUser.refreshVersion ?? 0,
    },
    refreshedResponse,
  };
}

export async function requireAuth(options = {}) {
  const { roles = [] } = options;
  const { user, refreshedResponse } = await getAuthUser({ allowRefresh: true });

  if (!user) {
    return { user: null, errorResponse: await unauthorizedResponse(), refreshedResponse: null };
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return {
      user: null,
      refreshedResponse,
      errorResponse: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, errorResponse: null, refreshedResponse };
}

export function applyRefreshCookies(response, refreshedResponse) {
  if (!response || !refreshedResponse) return response;
  const access = refreshedResponse.cookies.get(AUTH_COOKIE_NAME);
  const refresh = refreshedResponse.cookies.get(REFRESH_COOKIE_NAME);
  if (access) response.cookies.set(access.name, access.value, access);
  if (refresh) response.cookies.set(refresh.name, refresh.value, refresh);
  return response;
}

export function clearSessionResponse() {
  const res = NextResponse.json({ ok: false, error: "Session expired" }, { status: 401 });
  clearAuthCookies(res);
  return res;
}