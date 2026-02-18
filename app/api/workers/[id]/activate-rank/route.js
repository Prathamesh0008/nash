import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ActiveBoost from "@/models/ActiveBoost";
import BoostPlan from "@/models/BoostPlan";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function POST(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  if (user.role === "worker" && user.userId !== id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (!mongoose.Types.ObjectId.isValid(body.planId || "")) {
    return NextResponse.json({ ok: false, error: "planId required" }, { status: 400 });
  }

  const plan = await BoostPlan.findById(body.planId).lean();
  if (!plan || !plan.active) {
    return NextResponse.json({ ok: false, error: "Plan unavailable" }, { status: 404 });
  }

  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + Number(plan.durationDays) * 24 * 60 * 60 * 1000);

  const boost = await ActiveBoost.create({
    workerId: id,
    planId: plan._id,
    area: body.area || "",
    category: body.category || "",
    boostScore: plan.boostScore,
    startAt,
    endAt,
    status: "active",
  });

  const res = NextResponse.json({ ok: true, boost });
  return applyRefreshCookies(res, refreshedResponse);
}