import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ReschedulePolicy from "@/models/ReschedulePolicy";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { parseOrThrow, reschedulePolicySchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  let policy = await ReschedulePolicy.findOne({ active: true }).sort({ updatedAt: -1 }).lean();
  if (!policy) {
    policy = (await ReschedulePolicy.create({})).toObject();
  }

  const res = NextResponse.json({ ok: true, policy });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function PUT(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(reschedulePolicySchema, await req.json());

    await ReschedulePolicy.updateMany({ active: true }, { $set: { active: false } });
    const policy = await ReschedulePolicy.create({ ...data, active: true });

    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "reschedule.policy.update",
      targetType: "reschedulePolicy",
      targetId: policy._id,
      metadata: data,
      req,
    });

    const res = NextResponse.json({ ok: true, policy });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to update policy" }, { status: error.status || 400 });
  }
}