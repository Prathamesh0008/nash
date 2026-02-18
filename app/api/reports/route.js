import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Report from "@/models/Report";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { reportSchema, parseOrThrow } from "@/lib/validators";
import { enforceRateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { getReportSeverity } from "@/lib/reporting";
import { createNotification, notifyAdmins } from "@/lib/notify";

const ALLOWED_BOOKING_STATUSES = ["assigned", "working", "completed"];

function getReportSlaHours(severity) {
  if (severity === "critical") return 2;
  if (severity === "high") return 6;
  if (severity === "medium") return 24;
  return 48;
}

export async function POST(req) {
  const rl = enforceRateLimit({
    key: getRateLimitKey(req, "report"),
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many reports submitted" }, { status: 429 });
  }

  await dbConnect();

  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(reportSchema, await req.json());
    if (!mongoose.Types.ObjectId.isValid(data.bookingId)) {
      return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
    }

    const booking = await Booking.findById(data.bookingId).lean();
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    const isUserReporter = user.role === "user" && booking.userId?.toString() === user.userId;
    const isWorkerReporter = user.role === "worker" && booking.workerId?.toString() === user.userId;

    if (!isUserReporter && !isWorkerReporter) {
      return NextResponse.json({ ok: false, error: "You can report only your booking" }, { status: 403 });
    }

    if (!ALLOWED_BOOKING_STATUSES.includes(booking.status)) {
      return NextResponse.json({ ok: false, error: "Reporting not allowed at current status" }, { status: 400 });
    }

    if (booking.status === "completed") {
      const windowEnd = booking.reportWindowEndsAt
        ? new Date(booking.reportWindowEndsAt)
        : new Date(new Date(booking.updatedAt).getTime() + 14 * 24 * 60 * 60 * 1000);
      if (new Date() > windowEnd) {
        return NextResponse.json({ ok: false, error: "Report window expired" }, { status: 400 });
      }
    }

    const targetId = isUserReporter ? booking.workerId : booking.userId;
    if (!targetId) {
      return NextResponse.json({ ok: false, error: "Target not available for reporting" }, { status: 400 });
    }

    const severity = getReportSeverity(data.category, data.message);
    const report = await Report.create({
      bookingId: booking._id,
      reporterId: user.userId,
      reporterType: isUserReporter ? "user" : "worker",
      targetId,
      targetType: isUserReporter ? "worker" : "user",
      category: data.category,
      message: data.message,
      evidence: data.evidence || [],
      severity,
      slaDueAt: new Date(Date.now() + getReportSlaHours(severity) * 60 * 60 * 1000),
      status: "open",
    });

    await createNotification({
      userId: user.userId,
      actorId: user.userId,
      type: "system",
      title: "Report submitted successfully",
      body: "Admin team will review your report.",
      href: "/support",
      meta: { reportId: report._id.toString(), bookingId: booking._id.toString() },
    });

    await notifyAdmins({
      actorId: user.userId,
      type: "status",
      title: "New report filed",
      body: `Category: ${report.category} | Severity: ${report.severity}`,
      href: `/admin/reports`,
      meta: { reportId: report._id.toString(), bookingId: booking._id.toString() },
    });

    await User.updateOne({ _id: user.userId }, { $inc: { "reportStats.submittedCount": 1 } });

    const res = NextResponse.json({ ok: true, report });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    const isDuplicate = String(error?.message || "").includes("duplicate key");
    const message = isDuplicate ? "Only one report allowed per booking per side" : error.message;
    return NextResponse.json({ ok: false, error: message || "Failed to create report" }, { status: isDuplicate ? 409 : error.status || 400 });
  }
}
