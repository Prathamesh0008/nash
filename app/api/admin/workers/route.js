import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { computeWorkerQuality } from "@/lib/workerQuality";

const ALLOWED_VERIFICATION_STATUS = ["INCOMPLETE", "PENDING_REVIEW", "APPROVED", "REJECTED"];
const ALLOWED_QUEUE_STATUS = ["not_submitted", "pending_review", "in_review", "approved", "rejected", "reupload_required"];

export async function GET(req) {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const verificationStatus = String(searchParams.get("verificationStatus") || "").trim().toUpperCase();
  const queueStatus = String(searchParams.get("queueStatus") || "").trim();
  const feePaid = String(searchParams.get("feePaid") || "").trim().toLowerCase();
  const flagged = String(searchParams.get("flagged") || "").trim().toLowerCase();
  const q = String(searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 200), 1), 500);

  const filter = {};
  if (ALLOWED_VERIFICATION_STATUS.includes(verificationStatus)) {
    filter.verificationStatus = verificationStatus;
  }
  if (ALLOWED_QUEUE_STATUS.includes(queueStatus)) {
    filter["kyc.queueStatus"] = queueStatus;
  }
  if (feePaid === "1" || feePaid === "true") {
    filter.verificationFeePaid = true;
  }
  if (feePaid === "0" || feePaid === "false") {
    filter.verificationFeePaid = false;
  }

  const workers = await WorkerProfile.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const userIds = workers.map((w) => w.userId);
  const users = await User.find({ _id: { $in: userIds } }).select("name email phone status").lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  let rows = workers.map((worker) => {
    const quality = computeWorkerQuality(worker);
    return {
      ...worker,
      user: userMap.get(worker.userId?.toString()) || null,
      quality,
      autoFlags: quality.autoFlags || [],
    };
  });

  if (flagged === "1" || flagged === "true") {
    rows = rows.filter((worker) => (worker.autoFlags || []).length > 0);
  }

  if (q) {
    rows = rows.filter((worker) => {
      const userText = `${worker.user?.name || ""} ${worker.user?.email || ""} ${worker.user?.phone || ""}`.toLowerCase();
      const workerText = `${worker.address || ""} ${(worker.skills || []).join(" ")} ${(worker.categories || []).join(" ")}`.toLowerCase();
      const areaText = (worker.serviceAreas || []).map((a) => `${a.city || ""} ${a.pincode || ""}`).join(" ").toLowerCase();
      const flagText = (worker.autoFlags || []).join(" ").toLowerCase();
      return userText.includes(q) || workerText.includes(q) || areaText.includes(q) || flagText.includes(q);
    });
  }

  const summary = rows.reduce(
    (acc, item) => {
      acc.total += 1;
      const status = item.verificationStatus || "INCOMPLETE";
      acc.byVerificationStatus[status] = (acc.byVerificationStatus[status] || 0) + 1;
      const queue = item?.kyc?.queueStatus || "not_submitted";
      acc.byQueueStatus[queue] = (acc.byQueueStatus[queue] || 0) + 1;
      if ((item.autoFlags || []).length > 0) acc.flagged += 1;
      return acc;
    },
    {
      total: 0,
      flagged: 0,
      byVerificationStatus: {
        INCOMPLETE: 0,
        PENDING_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0,
      },
      byQueueStatus: {
        not_submitted: 0,
        pending_review: 0,
        in_review: 0,
        approved: 0,
        rejected: 0,
        reupload_required: 0,
      },
    }
  );

  const res = NextResponse.json({ ok: true, workers: rows, summary });
  return applyRefreshCookies(res, refreshedResponse);
}
