import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { reportDisputeAdminSchema, parseOrThrow } from "@/lib/validators";
import { createNotification } from "@/lib/notify";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid report id" }, { status: 400 });
  }

  try {
    const data = parseOrThrow(reportDisputeAdminSchema, await req.json());
    const report = await Report.findById(id);
    if (!report) return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });

    if (report.disputeStatus === "none") {
      return NextResponse.json({ ok: false, error: "No active dispute for this report" }, { status: 400 });
    }

    const now = new Date();
    report.firstResponseAt = report.firstResponseAt || now;
    report.disputeStatus = data.status;
    if (data.status === "reviewing") {
      report.status = "investigating";
    }

    if (data.status === "closed") {
      report.disputeResolvedAt = now;
      report.disputeResolutionNote = data.resolutionNote || "Dispute closed by admin";
      report.status = "resolved";
      report.resolvedAt = report.resolvedAt || now;
      report.slaDueAt = null;
    }

    await report.save();

    const notifyUserIds = [report.reporterId?.toString(), report.targetId?.toString(), report.disputeRaisedBy?.toString()].filter(Boolean);
    const uniqueUserIds = [...new Set(notifyUserIds)];

    for (const userId of uniqueUserIds) {
      await createNotification({
        userId,
        actorId: user.userId,
        type: "status",
        title: "Report dispute updated",
        body: data.status === "closed" ? "Dispute has been resolved." : "Dispute is under admin review.",
        href: "/support",
        meta: {
          reportId: report._id.toString(),
          disputeStatus: report.disputeStatus,
          resolutionNote: report.disputeResolutionNote || "",
        },
      });
    }

    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "report.dispute.action",
      targetType: "report",
      targetId: report._id,
      metadata: {
        disputeStatus: data.status,
        resolutionNote: data.resolutionNote || "",
      },
      req,
    });

    const res = NextResponse.json({ ok: true, report });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to process dispute" }, { status: error.status || 400 });
  }
}
