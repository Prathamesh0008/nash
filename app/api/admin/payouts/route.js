import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payout from "@/models/Payout";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import Booking from "@/models/Booking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { notifyAdmins } from "@/lib/notify";

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const statusFilter = (url.searchParams.get("status") || "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 200), 1), 500);

  const filter = user.role === "worker" ? { workerId: user.userId } : {};
  if (statusFilter && ["requested", "approved", "paid", "rejected"].includes(statusFilter)) {
    filter.status = statusFilter;
  }

  const payouts = await Payout.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

  const workerIds = [...new Set(payouts.map((payout) => payout.workerId?.toString()).filter(Boolean))];
  const workers = await User.find({ _id: { $in: workerIds } }).select("name email phone").lean();
  const workerMap = new Map(workers.map((worker) => [worker._id.toString(), worker]));

  const rows = payouts.map((payout) => ({
    ...payout,
    worker: workerMap.get(payout.workerId?.toString()) || null,
  }));

  const summary = rows.reduce(
    (acc, payout) => {
      const status = payout.status || "requested";
      acc.counts[status] = (acc.counts[status] || 0) + 1;
      acc.totals[status] = (acc.totals[status] || 0) + Number(payout.amount || 0);
      acc.totalAmount += Number(payout.amount || 0);
      return acc;
    },
    {
      counts: { requested: 0, approved: 0, paid: 0, rejected: 0 },
      totals: { requested: 0, approved: 0, paid: 0, rejected: 0 },
      totalAmount: 0,
    }
  );

  let earningSummary = null;
  if (user.role === "worker") {
    const completed = await Booking.find({ workerId: user.userId, status: "completed" })
      .select("priceBreakup.total")
      .lean();
    const gross = completed.reduce((sum, booking) => sum + Number(booking?.priceBreakup?.total || 0), 0);
    const platformFee = Math.round(gross * 0.2);
    const net = gross - platformFee;
    earningSummary = {
      totalCompletedJobs: completed.length,
      grossAmount: gross,
      platformFee,
      netAmount: net,
    };
  }

  const res = NextResponse.json({ ok: true, payouts: rows, summary, earningSummary });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid payout amount" }, { status: 400 });
  }

  const profile = await WorkerProfile.findOne({ userId: user.userId });
  if (!profile) return NextResponse.json({ ok: false, error: "Worker profile not found" }, { status: 404 });

  if (Number(profile.payoutWalletBalance || 0) < amount) {
    return NextResponse.json({ ok: false, error: "Insufficient payout wallet balance" }, { status: 400 });
  }

  profile.payoutWalletBalance = Number(profile.payoutWalletBalance || 0) - amount;
  await profile.save();

  const payout = await Payout.create({
    workerId: user.userId,
    amount,
    status: "requested",
    note: String(body.note || "").trim(),
  });

  await notifyAdmins({
    actorId: user.userId,
    type: "status",
    title: "New payout request",
    body: `Worker requested INR ${amount}`,
    href: "/admin/payouts",
    meta: { payoutId: payout._id.toString(), workerId: user.userId, amount },
  });

  const res = NextResponse.json({ ok: true, payout, payoutWalletBalance: profile.payoutWalletBalance });
  return applyRefreshCookies(res, refreshedResponse);
}
