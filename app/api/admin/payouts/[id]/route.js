import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payout from "@/models/Payout";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";

const allowedTransitions = {
  requested: ["approved", "rejected"],
  approved: ["paid", "rejected"],
  paid: [],
  rejected: [],
};

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid payout id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body.status;

  if (!["approved", "paid", "rejected"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid payout status" }, { status: 400 });
  }

  const payout = await Payout.findById(id);
  if (!payout) return NextResponse.json({ ok: false, error: "Payout not found" }, { status: 404 });
  const previousStatus = payout.status;

  if (status !== previousStatus) {
    const allowed = allowedTransitions[previousStatus] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { ok: false, error: `Invalid transition: ${previousStatus} -> ${status}` },
        { status: 400 }
      );
    }
  }

  if (status === "rejected" && !payout.walletRefunded) {
    await WorkerProfile.updateOne(
      { userId: payout.workerId },
      { $inc: { payoutWalletBalance: Number(payout.amount || 0) } }
    );
    payout.walletRefunded = true;
  }

  payout.status = status;
  payout.note = String(body.note || payout.note || "").trim();
  payout.bankRef = String(body.bankRef || payout.bankRef || "").trim();
  payout.processedBy = user.userId;
  payout.processedAt = new Date();
  await payout.save();

  await createNotification({
    userId: payout.workerId,
    actorId: user.userId,
    type: "status",
    title: `Payout ${status}`,
    body:
      status === "rejected" && payout.walletRefunded
        ? `Payout rejected. INR ${payout.amount} returned to payout wallet.`
        : `Payout request updated to ${status}.`,
    href: "/worker/payouts",
    meta: { payoutId: payout._id.toString(), status },
  });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "payout.update",
    targetType: "payout",
    targetId: payout._id,
    metadata: {
      fromStatus: previousStatus,
      toStatus: status,
      bankRef: payout.bankRef,
      note: payout.note,
      walletRefunded: payout.walletRefunded,
    },
    req,
  });

  const res = NextResponse.json({ ok: true, payout });
  return applyRefreshCookies(res, refreshedResponse);
}
