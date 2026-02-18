import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid user id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  if (!["active", "blocked"].includes(body.status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const updated = await User.findByIdAndUpdate(id, { $set: { status: body.status } }, { new: true }).lean();
  if (!updated) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "user.status.update",
    targetType: "user",
    targetId: id,
    metadata: { status: body.status },
    req,
  });

  const res = NextResponse.json({ ok: true, user: updated });
  return applyRefreshCookies(res, refreshedResponse);
}