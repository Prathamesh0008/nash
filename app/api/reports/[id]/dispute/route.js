import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { reportDisputeSchema, parseOrThrow } from "@/lib/validators";
import { createNotification, notifyAdmins } from "@/lib/notify";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid report id" }, { status: 400 });
  }

  try {
    const data = parseOrThrow(reportDisputeSchema, await req.json());
    const report = await Report.findById(id);
    if (!report) return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });

    const canDispute = report.reporterId?.toString() === user.userId || report.targetId?.toString() === user.userId;
    if (!canDispute) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    if (!["resolved", "closed"].includes(report.status)) {
      return NextResponse.json({ ok: false, error: "Dispute can be raised after report resolution" }, { status: 400 });
    }

    if (["raised", "reviewing"].includes(report.disputeStatus)) {
      return NextResponse.json({ ok: false, error: "Dispute is already in progress" }, { status: 409 });
    }

    const now = new Date();
    report.disputeStatus = "raised";
    report.disputeMessage = data.message;
    report.disputeRaisedBy = user.userId;
    report.disputeRaisedAt = now;
    report.disputeResolvedAt = null;
    report.disputeResolutionNote = "";
    report.status = "investigating";
    report.resolvedAt = null;
    report.slaDueAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await report.save();

    await createNotification({
      userId: user.userId,
      actorId: user.userId,
      type: "status",
      title: "Dispute raised successfully",
      body: "Admin team will re-review your report.",
      href: "/support",
      meta: { reportId: report._id.toString(), disputeStatus: report.disputeStatus },
    });

    await notifyAdmins({
      actorId: user.userId,
      type: "status",
      title: "Report dispute raised",
      body: `Report ${report._id.toString().slice(-6)} moved to dispute flow`,
      href: "/admin/reports",
      meta: { reportId: report._id.toString(), disputeStatus: report.disputeStatus },
    });

    const res = NextResponse.json({ ok: true, report });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to raise dispute" }, { status: error.status || 400 });
  }
}
