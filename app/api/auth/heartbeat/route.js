import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function POST() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  await User.updateOne({ _id: user.userId }, { $set: { lastSeenAt: new Date() } });
  const res = NextResponse.json({ ok: true });
  return applyRefreshCookies(res, refreshedResponse);
}