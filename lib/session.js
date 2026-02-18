import RefreshToken from "@/models/RefreshToken";
import { clearAuthCookies, hashToken, issueTokensForUser, setAccessCookie, setRefreshCookie } from "@/lib/auth";

export async function createSessionResponse({ user, response, req }) {
  const { accessToken, refreshToken } = issueTokensForUser(user);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    ip: req.headers.get("x-forwarded-for") || "",
    userAgent: req.headers.get("user-agent") || "",
  });

  setAccessCookie(response, accessToken);
  setRefreshCookie(response, refreshToken);
  return response;
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await RefreshToken.updateMany(
    { tokenHash, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

export function clearSession(response) {
  clearAuthCookies(response);
  return response;
}