import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupportTicket from "@/models/SupportTicket";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notify";
import { scanProhibitedContent } from "@/lib/prohibitedDetection";
import { createRiskSignal } from "@/lib/riskSignals";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid ticket id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  const status = String(body.status || "").trim();

  if (!message) {
    return NextResponse.json({ ok: false, error: "Reply message is required" }, { status: 400 });
  }

  const moderation = scanProhibitedContent(message, {
    channel: "support_reply",
    actorRole: user.role,
  });
  if (moderation.matched) {
    await createRiskSignal({
      userId: user.userId,
      signalType: "support_reply_policy_violation",
      severity: moderation.severity,
      reasons: moderation.reasons,
      meta: {
        ticketId: id,
        shouldBlock: moderation.shouldBlock,
      },
      actorId: user.userId,
      actorRole: user.role,
      req,
    });
    if (moderation.shouldBlock) {
      return NextResponse.json(
        { ok: false, error: "Reply contains prohibited content and cannot be posted." },
        { status: 400 }
      );
    }
  }

  const ticket = await SupportTicket.findById(id);
  if (!ticket) return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });

  const isOwner = ticket.userId?.toString() === user.userId;
  if (user.role !== "admin" && !isOwner) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  ticket.replies.push({
    actorId: user.userId,
    actorRole: user.role,
    message,
    createdAt: new Date(),
  });

  if (user.role === "admin") {
    ticket.assignedTo = user.userId;
    if (status && ["open", "in_progress", "resolved", "closed"].includes(status)) {
      ticket.status = status;
    } else if (ticket.status === "open") {
      ticket.status = "in_progress";
    }
  } else if (ticket.status === "resolved" || ticket.status === "closed") {
    ticket.status = "open";
  }

  const now = new Date();
  ticket.lastReplyAt = now;
  if (user.role === "admin" && !ticket.firstResponseAt) {
    ticket.firstResponseAt = now;
  }
  if (["resolved", "closed"].includes(ticket.status) && !ticket.resolvedAt) {
    ticket.resolvedAt = now;
  }
  ticket.auditTrail = Array.isArray(ticket.auditTrail) ? ticket.auditTrail : [];
  ticket.auditTrail.push({
    action: "reply_added",
    actorId: user.userId,
    actorRole: user.role,
    note: `Status:${ticket.status}`,
    at: now,
  });
  await ticket.save();

  if (user.role === "admin") {
    await createNotification({
      userId: ticket.userId,
      actorId: user.userId,
      type: "status",
      title: `Support update on ${ticket.ticketNo}`,
      body: "Admin replied to your ticket.",
      href: "/support",
      meta: { ticketId: ticket._id.toString(), ticketNo: ticket.ticketNo },
    });
  }

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "support.ticket.reply",
    targetType: "support_ticket",
    targetId: ticket._id,
    metadata: {
      ticketNo: ticket.ticketNo,
      status: ticket.status,
      byAdmin: user.role === "admin",
    },
    req,
  });

  const res = NextResponse.json({ ok: true, ticket });
  return applyRefreshCookies(res, refreshedResponse);
}
