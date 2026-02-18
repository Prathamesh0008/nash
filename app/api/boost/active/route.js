import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ActiveBoost from "@/models/ActiveBoost";
import BoostPlan from "@/models/BoostPlan";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const filter = user.role === "worker" ? { workerId: user.userId } : {};

  const boosts = await ActiveBoost.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  const planIds = [...new Set(boosts.map((b) => b.planId?.toString()).filter(Boolean))];
  const plans = await BoostPlan.find({ _id: { $in: planIds } }).select("name price durationDays boostScore").lean();
  const planMap = new Map(plans.map((p) => [p._id.toString(), p]));

  const rows = boosts.map((boost) => ({
    ...boost,
    plan: planMap.get(boost.planId?.toString()) || null,
  }));

  const res = NextResponse.json({ ok: true, boosts: rows });
  return applyRefreshCookies(res, refreshedResponse);
}