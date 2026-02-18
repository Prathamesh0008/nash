import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { normalizeAddressList } from "@/lib/geo";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const profile = await User.findById(user.userId).select("name email phone role status addresses walletBalance referralCode referralStats preferences").lean();
  const res = NextResponse.json({ ok: true, user: profile });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const patch = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.phone === "string") patch.phone = body.phone.trim();
  if (Array.isArray(body.addresses)) patch.addresses = normalizeAddressList(body.addresses);

  const updated = await User.findByIdAndUpdate(user.userId, { $set: patch }, { new: true })
    .select("name email phone role status addresses walletBalance referralCode referralStats preferences")
    .lean();

  const res = NextResponse.json({ ok: true, user: updated });
  return applyRefreshCookies(res, refreshedResponse);
}
