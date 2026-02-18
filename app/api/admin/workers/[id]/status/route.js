import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

const MAP = {
  active: "APPROVED",
  pending: "PENDING_REVIEW",
  rejected: "REJECTED",
};

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body.status;
  const reason = String(body.reason || "").trim();
  if (!MAP[status]) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const now = new Date();
  const update = {
    verificationStatus: MAP[status],
    ...(reason ? { verificationNote: reason } : {}),
    ...(MAP[status] === "APPROVED" ? { accountStatus: "LIVE" } : {}),
    ...(MAP[status] !== "APPROVED" ? { accountStatus: "ONBOARDED" } : {}),
    ...(MAP[status] !== "APPROVED" ? { isOnline: false } : {}),
    ...(MAP[status] === "APPROVED"
      ? {
          "kyc.queueStatus": "approved",
          "kyc.reviewedAt": now,
          "kyc.reviewedBy": user.userId,
          "kyc.rejectionReason": "",
          "kyc.reuploadRequestedAt": null,
          "kyc.reviewSlaDueAt": null,
        }
      : MAP[status] === "PENDING_REVIEW"
        ? {
          "kyc.queueStatus": "pending_review",
          "kyc.submittedAt": now,
          "kyc.reviewedAt": null,
          "kyc.reviewedBy": null,
          "kyc.rejectionReason": "",
          "kyc.reviewSlaDueAt": new Date(now.getTime() + 48 * 60 * 60 * 1000),
          }
        : {
            "kyc.queueStatus": "rejected",
            "kyc.reviewedAt": now,
            "kyc.reviewedBy": user.userId,
            "kyc.rejectionReason": reason || "Rejected by admin",
            "kyc.reviewSlaDueAt": null,
          }),
  };

  const worker = await WorkerProfile.findOneAndUpdate(
    { userId: id },
    {
      $set: update,
      $push: {
        "kyc.history": {
          action: MAP[status] === "APPROVED" ? "approved" : MAP[status] === "PENDING_REVIEW" ? "in_review" : "rejected",
          reason: reason || "",
          actorId: user.userId,
          at: now,
        },
      },
    },
    { new: true }
  ).lean();
  if (!worker) return NextResponse.json({ ok: false, error: "Worker not found" }, { status: 404 });

  const res = NextResponse.json({ ok: true, worker });
  return applyRefreshCookies(res, refreshedResponse);
}
