import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PromoCode from "@/models/PromoCode";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid promo id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const patch = {};
  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.maxUses !== "undefined") patch.maxUses = Math.max(0, Number(body.maxUses || 0));
  if (typeof body.perUserLimit !== "undefined") patch.perUserLimit = Math.max(1, Number(body.perUserLimit || 1));
  if (typeof body.validTill !== "undefined") patch.validTill = body.validTill ? new Date(body.validTill) : null;
  if (typeof body.title !== "undefined") patch.title = String(body.title || "");
  if (typeof body.description !== "undefined") patch.description = String(body.description || "");

  const promo = await PromoCode.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
  if (!promo) return NextResponse.json({ ok: false, error: "Promo not found" }, { status: 404 });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "promo.patch",
    targetType: "promo",
    targetId: promo._id,
    metadata: patch,
    req,
  });

  const res = NextResponse.json({ ok: true, promo });
  return applyRefreshCookies(res, refreshedResponse);
}
