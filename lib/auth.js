import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_access_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

const ACCESS_COOKIE = "auth";
const REFRESH_COOKIE = "refresh";

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

export function hashToken(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function cookieBaseConfig() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function setAccessCookie(res, token) {
  res.cookies.set(ACCESS_COOKIE, token, {
    ...cookieBaseConfig(),
    maxAge: 60 * 15,
  });
}

export function setRefreshCookie(res, token) {
  res.cookies.set(REFRESH_COOKIE, token, {
    ...cookieBaseConfig(),
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(res) {
  res.cookies.set(ACCESS_COOKIE, "", {
    ...cookieBaseConfig(),
    expires: new Date(0),
  });
  res.cookies.set(REFRESH_COOKIE, "", {
    ...cookieBaseConfig(),
    expires: new Date(0),
  });
}

export function getTokenPayload(user) {
  return {
    userId: user._id.toString(),
    role: user.role,
    rv: user.refreshVersion ?? 0,
  };
}

export function issueTokensForUser(user) {
  const payload = getTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

// Backward compatible exports used by older files.
export const signToken = signAccessToken;
export const verifyToken = verifyAccessToken;
export function setAuthCookie(res, token) {
  return setAccessCookie(res, token);
}
export function clearAuthCookie(res) {
  return clearAuthCookies(res);
}

export const AUTH_COOKIE_NAME = ACCESS_COOKIE;
export const REFRESH_COOKIE_NAME = REFRESH_COOKIE;