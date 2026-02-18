import { NextResponse } from "next/server";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { buildUploadSignature } from "@/lib/cloudinaryServer";

export async function POST(req) {
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const folder = typeof body.folder === "string" && body.folder.trim() ? body.folder.trim() : `nash/${user.role}`;
    const signature = buildUploadSignature({ folder });
    const res = NextResponse.json({ ok: true, signature });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to sign upload" }, { status: 500 });
  }
}