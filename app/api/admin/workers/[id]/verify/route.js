import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { getWorkerOnboardingMissingFields } from "@/lib/workerOnboardingChecklist";
import { sendCrmTemplate } from "@/lib/crm";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action;
  const reason = String(body.reason || "").trim();

  if (!["approve", "reject", "reupload"].includes(action)) {
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  }

  if ((action === "reject" || action === "reupload") && !reason) {
    return NextResponse.json({ ok: false, error: "Rejection reason is required" }, { status: 400 });
  }

  const existing = await WorkerProfile.findOne({ userId: id }).lean();
  if (!existing) return NextResponse.json({ ok: false, error: "Worker not found" }, { status: 404 });

  if (action === "approve") {
    if (!existing.verificationFeePaid) {
      return NextResponse.json({ ok: false, error: "Verification fee is not paid" }, { status: 400 });
    }
    if (!existing?.kyc?.submittedAt) {
      return NextResponse.json(
        { ok: false, error: "Worker has not submitted onboarding for review yet" },
        { status: 400 }
      );
    }
    const missing = getWorkerOnboardingMissingFields(existing);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Onboarding is incomplete: ${missing.join(", ")}`,
          missingFields: missing,
        },
        { status: 400 }
      );
    }
  }

  const now = new Date();

  const update =
    action === "approve"
      ? {
          verificationStatus: "APPROVED",
          accountStatus: "LIVE",
          verificationNote: reason,
          "kyc.queueStatus": "approved",
          "kyc.reviewedAt": now,
          "kyc.reviewedBy": user.userId,
          "kyc.rejectionReason": "",
          "kyc.reuploadRequestedAt": null,
          "kyc.reviewSlaDueAt": null,
        }
      : action === "reject"
        ? {
            verificationStatus: "REJECTED",
            accountStatus: "ONBOARDED",
            isOnline: false,
            verificationNote: reason,
            "kyc.queueStatus": "rejected",
            "kyc.reviewedAt": now,
            "kyc.reviewedBy": user.userId,
            "kyc.rejectionReason": reason,
            "kyc.reuploadRequestedAt": null,
            "kyc.reviewSlaDueAt": null,
          }
        : {
            verificationStatus: "INCOMPLETE",
            accountStatus: "ONBOARDED",
            isOnline: false,
            verificationNote: reason,
            "kyc.queueStatus": "reupload_required",
            "kyc.reviewedAt": now,
            "kyc.reviewedBy": user.userId,
            "kyc.rejectionReason": reason,
            "kyc.reuploadRequestedAt": now,
            "kyc.reviewSlaDueAt": null,
          };

  const worker = await WorkerProfile.findOneAndUpdate(
    { userId: id },
    {
      $set: update,
      $push: {
        "kyc.history": {
          action:
            action === "approve"
              ? "approved"
              : action === "reject"
                ? "rejected"
                : "reupload_requested",
          reason: reason || "",
          actorId: user.userId,
          at: now,
        },
      },
    },
    { new: true }
  ).lean();

  const titles = {
    approve: "Worker profile approved",
    reject: "Worker profile rejected",
    reupload: "Document re-upload requested",
  };
  const statusLabel = {
    approve: "APPROVED",
    reject: "REJECTED",
    reupload: "REUPLOAD REQUIRED",
  }[action] || "UPDATED";

  await createNotification({
    userId: id,
    actorId: user.userId,
    type: "status",
    title: titles[action] || "Worker profile update",
    body: reason || "Please check your onboarding status.",
    href: "/worker/dashboard",
    meta: { action, verificationStatus: worker.verificationStatus },
  });

  await Promise.all([
    sendCrmTemplate({
      templateKey: "worker_verification_update",
      channel: "email",
      userId: id,
      variables: { statusLabel, reason: reason || "Please check your dashboard for details." },
      meta: { action, verificationStatus: worker.verificationStatus },
    }),
    sendCrmTemplate({
      templateKey: "worker_verification_update",
      channel: "sms",
      userId: id,
      variables: { statusLabel, reason: reason || "Open worker dashboard for details." },
      meta: { action, verificationStatus: worker.verificationStatus },
    }),
    sendCrmTemplate({
      templateKey: "worker_verification_update",
      channel: "whatsapp",
      userId: id,
      variables: { statusLabel, reason: reason || "Open worker dashboard for details." },
      meta: { action, verificationStatus: worker.verificationStatus },
    }),
  ]);

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "worker.verification.action",
    targetType: "worker",
    targetId: id,
    metadata: { action, reason },
    req,
  });

  const res = NextResponse.json({ ok: true, worker });
  return applyRefreshCookies(res, refreshedResponse);
}
