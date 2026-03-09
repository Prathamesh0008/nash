import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import PanicAlert from "@/models/PanicAlert";
import SupportTicket from "@/models/SupportTicket";
import { createNotification } from "@/lib/notify";
import { writeAuditLog } from "@/lib/audit";

const STATUS_MAP = {
  open: "open",
  acknowledged: "acknowledged",
  in_progress: "in_progress",
  escalated: "escalated",
  resolved: "resolved",
  false_alarm: "false_alarm",
};

const TICKET_STATUS_MAP = {
  open: "open",
  acknowledged: "in_progress",
  in_progress: "in_progress",
  escalated: "in_progress",
  resolved: "resolved",
  false_alarm: "closed",
};

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid panic alert id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const nextStatus = STATUS_MAP[String(body.status || "").trim()];
  const note = String(body.note || "").trim();
  if (!nextStatus) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const alert = await PanicAlert.findById(id);
  if (!alert) return NextResponse.json({ ok: false, error: "Panic alert not found" }, { status: 404 });

  const now = new Date();
  alert.status = nextStatus;
  alert.assignedTo = user.userId;
  if (!alert.firstResponseAt && ["acknowledged", "in_progress", "escalated", "resolved", "false_alarm"].includes(nextStatus)) {
    alert.firstResponseAt = now;
  }
  if (["resolved", "false_alarm"].includes(nextStatus)) {
    alert.resolvedAt = now;
  }
  alert.timeline = Array.isArray(alert.timeline) ? alert.timeline : [];
  alert.timeline.push({
    action: `status_${nextStatus}`,
    actorId: user.userId,
    actorRole: "admin",
    note,
    at: now,
  });
  await alert.save();

  if (alert.ticketId) {
    const ticket = await SupportTicket.findById(alert.ticketId);
    if (ticket) {
      ticket.status = TICKET_STATUS_MAP[nextStatus] || ticket.status;
      ticket.assignedTo = user.userId;
      if (!ticket.firstResponseAt && alert.firstResponseAt) ticket.firstResponseAt = alert.firstResponseAt;
      if (["resolved", "false_alarm"].includes(nextStatus) && !ticket.resolvedAt) ticket.resolvedAt = now;
      ticket.auditTrail = Array.isArray(ticket.auditTrail) ? ticket.auditTrail : [];
      ticket.auditTrail.push({
        action: `panic_status_${nextStatus}`,
        actorId: user.userId,
        actorRole: "admin",
        note: note || "Updated from panic moderation console",
        at: now,
      });
      ticket.lastReplyAt = now;
      await ticket.save();
    }
  }

  await createNotification({
    userId: alert.raisedBy,
    actorId: user.userId,
    type: "status",
    title: `Panic alert ${alert.alertNo} updated`,
    body: `Status changed to ${nextStatus.replaceAll("_", " ")}.`,
    href: "/support",
    meta: { panicAlertId: alert._id.toString(), status: nextStatus },
  });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: "admin",
    action: "safety.panic.update",
    targetType: "panic_alert",
    targetId: alert._id,
    metadata: {
      alertNo: alert.alertNo,
      status: nextStatus,
      note,
    },
    req,
  });

  const res = NextResponse.json({ ok: true, alert });
  return applyRefreshCookies(res, refreshedResponse);
}
