import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ReschedulePolicy from "@/models/ReschedulePolicy";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  let policy = await ReschedulePolicy.findOne({ active: true }).sort({ updatedAt: -1 }).lean();
  if (!policy) {
    policy = (await ReschedulePolicy.create({})).toObject();
  }

  const res = NextResponse.json({ ok: true, policy });
  return applyRefreshCookies(res, refreshedResponse);
}
