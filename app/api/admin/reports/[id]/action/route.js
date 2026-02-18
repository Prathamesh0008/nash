import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { reportActionSchema, parseOrThrow } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";

const FALSE_REPORT_BAN_THRESHOLD = Number(process.env.FALSE_REPORT_BAN_THRESHOLD || 3);
const TEMP_BAN_DAYS = Number(process.env.TEMP_BAN_DAYS || 7);
const FALSE_REPORT_BLOCK_DAYS = Number(process.env.FALSE_REPORT_BLOCK_DAYS || 30);
const PERMA_BAN_UNTIL = new Date("2099-12-31T23:59:59.000Z");

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid report id" }, { status: 400 });
  }

  try {
    const data = parseOrThrow(reportActionSchema, await req.json());

    const report = await Report.findById(id);
    if (!report) return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });

    const now = new Date();
    const isTerminalStatus = ["resolved", "closed"].includes(data.status);
    const shouldApplyTargetPenalty =
      !report.penaltyApplied &&
      !data.falseReport &&
      ["warning", "tempBan", "permaBan"].includes(data.adminAction);

    report.status = data.status;
    report.adminAction = data.adminAction;
    report.adminNotes = data.adminNotes;
    report.falseReportMarked = data.falseReport;
    report.firstResponseAt = report.firstResponseAt || now;
    report.resolvedAt = isTerminalStatus ? report.resolvedAt || now : null;
    report.slaDueAt = isTerminalStatus ? null : report.slaDueAt || new Date(now.getTime() + 6 * 60 * 60 * 1000);
    if (report.disputeStatus === "raised" && data.status === "investigating") {
      report.disputeStatus = "reviewing";
    }
    if (isTerminalStatus && ["raised", "reviewing"].includes(report.disputeStatus)) {
      report.disputeStatus = "closed";
      report.disputeResolvedAt = now;
      report.disputeResolutionNote = report.disputeResolutionNote || data.adminNotes || "Dispute closed by admin action";
    }
    if (shouldApplyTargetPenalty) {
      report.penaltyApplied = true;
    }
    await report.save();

    if (shouldApplyTargetPenalty && report.targetType === "worker") {
      await WorkerProfile.updateOne(
        { userId: report.targetId },
        {
          $inc: {
            "penalties.reportFlags": 1,
            "penalties.strikes": data.adminAction === "tempBan" || data.adminAction === "permaBan" ? 1 : 0,
          },
        }
      );
    }

    if (data.adminAction === "tempBan" || data.adminAction === "permaBan") {
      const blockedUntil = data.adminAction === "tempBan" ? new Date(now.getTime() + TEMP_BAN_DAYS * 24 * 60 * 60 * 1000) : PERMA_BAN_UNTIL;
      await User.updateOne(
        { _id: report.targetId },
        {
          $set: {
            status: "blocked",
            blockedUntil,
            blockReason: data.adminNotes || `Blocked due to report action: ${data.adminAction}`,
          },
        }
      );
      if (report.targetType === "worker") {
        await WorkerProfile.updateOne({ userId: report.targetId }, { $set: { isOnline: false } });
      }
    }

    let falseReportCount = null;
    let reporterBlocked = false;
    if (data.falseReport) {
      const updatedReporter = await User.findByIdAndUpdate(
        report.reporterId,
        { $inc: { "reportStats.falseCount": 1 } },
        { new: true }
      ).select("status reportStats.falseCount");

      falseReportCount = Number(updatedReporter?.reportStats?.falseCount || 0);
      if (falseReportCount >= FALSE_REPORT_BAN_THRESHOLD && updatedReporter?.status !== "blocked") {
        await User.updateOne(
          { _id: report.reporterId },
          {
            $set: {
              status: "blocked",
              blockedUntil: new Date(now.getTime() + FALSE_REPORT_BLOCK_DAYS * 24 * 60 * 60 * 1000),
              blockReason: `Repeated false reports (count: ${falseReportCount})`,
            },
          }
        );
        reporterBlocked = true;
      }
    }

    await createNotification({
      userId: report.reporterId,
      actorId: user.userId,
      type: "status",
      title: "Your report was reviewed",
      body: reporterBlocked
        ? `Status: ${data.status} | False reports reached ${falseReportCount}. Your account is blocked.`
        : `Status: ${data.status} | Action: ${data.adminAction}`,
      href: "/support",
      meta: {
        reportId: report._id.toString(),
        status: data.status,
        adminAction: data.adminAction,
        firstResponseAt: report.firstResponseAt,
        resolvedAt: report.resolvedAt,
        disputeStatus: report.disputeStatus,
        falseReportCount: falseReportCount ?? undefined,
        reporterBlocked,
      },
    });

    await createNotification({
      userId: report.targetId,
      actorId: user.userId,
      type: "status",
      title: "Report outcome updated",
      body: `Admin action: ${data.adminAction}`,
      href: report.targetType === "worker" ? "/worker/reports" : "/support",
      meta: { reportId: report._id.toString(), status: data.status, adminAction: data.adminAction },
    });

    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "report.action",
      targetType: "report",
      targetId: report._id,
      metadata: {
        status: data.status,
        adminAction: data.adminAction,
        falseReport: data.falseReport,
        targetPenaltyApplied: shouldApplyTargetPenalty,
        firstResponseAt: report.firstResponseAt,
        resolvedAt: report.resolvedAt,
        disputeStatus: report.disputeStatus,
        falseReportCount: falseReportCount ?? undefined,
        reporterBlocked,
      },
      req,
    });

    const res = NextResponse.json({ ok: true, report });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to update report" }, { status: error.status || 400 });
  }
}
