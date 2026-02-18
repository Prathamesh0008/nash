import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BoostPlan from "@/models/BoostPlan";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { boostPlanSchema, parseOrThrow } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const plans = await BoostPlan.find({}).sort({ createdAt: -1 }).lean();
  const res = NextResponse.json({ ok: true, plans });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(boostPlanSchema, await req.json());
    const plan = await BoostPlan.create(data);

    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "boost.plan.create",
      targetType: "boostPlan",
      targetId: plan._id,
      metadata: data,
      req,
    });

    const res = NextResponse.json({ ok: true, plan });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to create boost plan" }, { status: error.status || 400 });
  }
}