import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

const DEFAULT_LIMIT = 100;
const ALLOWED_QUEUE_STATUS = ["not_submitted", "pending_review", "in_review", "approved", "rejected", "reupload_required"];

export async function GET(req) {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const queueStatus = String(searchParams.get("queueStatus") || "").trim();
  const overdueOnly = searchParams.get("overdue") === "1";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || DEFAULT_LIMIT), 1), 300);

  const filter = {};
  if (queueStatus && ALLOWED_QUEUE_STATUS.includes(queueStatus)) {
    filter["kyc.queueStatus"] = queueStatus;
  }
  if (overdueOnly) {
    filter["kyc.reviewSlaDueAt"] = { $lte: new Date() };
    filter["kyc.queueStatus"] = { $in: ["pending_review", "in_review"] };
  }

  const workers = await WorkerProfile.find(filter)
    .sort({ "kyc.reviewSlaDueAt": 1, createdAt: -1 })
    .limit(limit)
    .lean();

  const userIds = workers.map((w) => w.userId).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).select("name email phone").lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const now = Date.now();
  const rows = workers.map((worker) => {
    const dueAt = worker?.kyc?.reviewSlaDueAt ? new Date(worker.kyc.reviewSlaDueAt).getTime() : null;
    const slaRemainingMs = dueAt ? dueAt - now : null;
    return {
      ...worker,
      user: userMap.get(String(worker.userId)) || null,
      kyc: {
        ...(worker.kyc || {}),
        slaRemainingMs,
        slaBreached: typeof slaRemainingMs === "number" ? slaRemainingMs < 0 : false,
      },
    };
  });

  const summary = rows.reduce(
    (acc, item) => {
      const status = item?.kyc?.queueStatus || "not_submitted";
      acc.total += 1;
      acc.byQueueStatus[status] = (acc.byQueueStatus[status] || 0) + 1;
      if (item?.kyc?.slaBreached) acc.slaBreached += 1;
      return acc;
    },
    {
      total: 0,
      slaBreached: 0,
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
