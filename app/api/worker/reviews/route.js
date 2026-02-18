import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const reviews = await Review.find({ workerUserId: user.userId }).sort({ createdAt: -1 }).lean();
  const res = NextResponse.json({ ok: true, reviews });
  return applyRefreshCookies(res, refreshedResponse);
}