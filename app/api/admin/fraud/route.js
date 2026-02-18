import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FraudSignal from "@/models/FraudSignal";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req) {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const status = String(searchParams.get("status") || "").trim();
  const severity = String(searchParams.get("severity") || "").trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 200), 1), 500);

  const filter = {};
  if (status && ["open", "reviewing", "resolved", "ignored"].includes(status)) filter.status = status;
  if (severity && ["low", "medium", "high", "critical"].includes(severity)) filter.severity = severity;

  const rows = await FraudSignal.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const userIds = [...new Set(rows.map((row) => row.userId?.toString()).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select("name email phone role").lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const signals = rows.map((row) => ({
    ...row,
    user: userMap.get(row.userId?.toString()) || null,
  }));

  const summary = signals.reduce(
    (acc, signal) => {
      acc.total += 1;
      acc.byStatus[signal.status] = (acc.byStatus[signal.status] || 0) + 1;
      acc.bySeverity[signal.severity] = (acc.bySeverity[signal.severity] || 0) + 1;
      return acc;
    },
    {
      total: 0,
      byStatus: { open: 0, reviewing: 0, resolved: 0, ignored: 0 },
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    }
  );

  const res = NextResponse.json({ ok: true, signals, summary });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const signalId = String(body.signalId || "").trim();
  const status = String(body.status || "").trim();
  if (!mongoose.Types.ObjectId.isValid(signalId)) {
    return NextResponse.json({ ok: false, error: "Invalid signal id" }, { status: 400 });
  }
  if (!["open", "reviewing", "resolved", "ignored"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const updated = await FraudSignal.findByIdAndUpdate(
    signalId,
    { $set: { status, reviewedBy: user.userId, reviewedAt: new Date() } },
    { new: true }
  ).lean();
  if (!updated) return NextResponse.json({ ok: false, error: "Signal not found" }, { status: 404 });

  const res = NextResponse.json({ ok: true, signal: updated });
  return applyRefreshCookies(res, refreshedResponse);
}
