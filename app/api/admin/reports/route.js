import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req) {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "").trim();
  const severity = (searchParams.get("severity") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const targetType = (searchParams.get("targetType") || "").trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 300), 1), 500);

  const filter = {};
  if (status) filter.status = status;
  if (severity) filter.severity = severity;
  if (category) filter.category = category;
  if (targetType) filter.targetType = targetType;

  const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const bookingIds = [...new Set(reports.map((r) => r.bookingId?.toString()).filter(Boolean))];
  const userIds = [...new Set(reports.flatMap((r) => [r.reporterId?.toString(), r.targetId?.toString()]).filter(Boolean))];

  const [bookings, users] = await Promise.all([
    Booking.find({ _id: { $in: bookingIds } }).select("status slotTime").lean(),
    User.find({ _id: { $in: userIds } }).select("name email role status").lean(),
  ]);

  const bookingMap = new Map(bookings.map((b) => [b._id.toString(), b]));
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const rows = reports.map((r) => ({
    ...r,
    slaBreached: r.slaDueAt ? new Date(r.slaDueAt).getTime() < Date.now() && ["open", "investigating"].includes(r.status) : false,
    booking: bookingMap.get(r.bookingId?.toString()) || null,
    reporter: userMap.get(r.reporterId?.toString()) || null,
    target: userMap.get(r.targetId?.toString()) || null,
  }));

  const summary = rows.reduce(
    (acc, report) => {
      const statusKey = report.status || "open";
      const severityKey = report.severity || "medium";
      acc.total += 1;
      acc.byStatus[statusKey] = (acc.byStatus[statusKey] || 0) + 1;
      acc.bySeverity[severityKey] = (acc.bySeverity[severityKey] || 0) + 1;
      if (report.slaBreached) acc.slaBreached += 1;
      if (["raised", "reviewing"].includes(report.disputeStatus)) acc.activeDisputes += 1;
      return acc;
    },
    {
      total: 0,
      slaBreached: 0,
      activeDisputes: 0,
      byStatus: { open: 0, investigating: 0, resolved: 0, closed: 0 },
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    }
  );

  const res = NextResponse.json({ ok: true, reports: rows, summary });
  return applyRefreshCookies(res, refreshedResponse);
}
