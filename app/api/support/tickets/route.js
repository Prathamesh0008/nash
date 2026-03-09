import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import Booking from "@/models/Booking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { notifyAdmins, createNotification } from "@/lib/notify";
import { scanProhibitedContent } from "@/lib/prohibitedDetection";
import { createRiskSignal } from "@/lib/riskSignals";
import { writeAuditLog } from "@/lib/audit";

const ALLOWED_CATEGORIES = ["booking", "payment", "payout", "account", "technical", "safety", "panic", "compliance", "other"];
const ALLOWED_PRIORITIES = ["low", "medium", "high", "critical"];
const FIRST_RESPONSE_SLA_MINUTES = {
  critical: Math.max(1, Number(process.env.SUPPORT_SLA_CRITICAL_MINUTES || 15)),
  high: Math.max(5, Number(process.env.SUPPORT_SLA_HIGH_MINUTES || 60)),
  medium: Math.max(10, Number(process.env.SUPPORT_SLA_MEDIUM_MINUTES || 240)),
  low: Math.max(30, Number(process.env.SUPPORT_SLA_LOW_MINUTES || 720)),
};

function buildTicketNo() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TKT-${stamp}-${rand}`;
}

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const status = String(searchParams.get("status") || "").trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 100), 1), 300);

  const filter = user.role === "admin" ? {} : { userId: user.userId };
  if (status && ["open", "in_progress", "resolved", "closed"].includes(status)) {
    filter.status = status;
  }

  const tickets = await SupportTicket.find(filter).sort({ updatedAt: -1 }).limit(limit).lean();
  const userIds = [...new Set(tickets.flatMap((row) => [row.userId?.toString(), row.assignedTo?.toString()]).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select("name email role").lean();
  const userMap = new Map(users.map((row) => [row._id.toString(), row]));

  const rows = tickets.map((ticket) => ({
    ...ticket,
    user: userMap.get(ticket.userId?.toString()) || null,
    assignedAdmin: userMap.get(ticket.assignedTo?.toString()) || null,
    slaRemainingMs: ticket?.slaFirstResponseDueAt ? new Date(ticket.slaFirstResponseDueAt).getTime() - Date.now() : null,
    slaBreached:
      ticket?.slaFirstResponseDueAt &&
      !ticket?.firstResponseAt &&
      ["open", "in_progress"].includes(ticket.status)
        ? new Date(ticket.slaFirstResponseDueAt).getTime() < Date.now()
        : false,
  }));

  const res = NextResponse.json({ ok: true, tickets: rows });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const subject = String(body.subject || "").trim();
  const category = String(body.category || "other").trim();
  const priority = String(body.priority || "medium").trim();
  const message = String(body.message || "").trim();
  const bookingId = String(body.bookingId || "").trim();
  const attachments = Array.isArray(body.attachments) ? body.attachments.filter(Boolean).slice(0, 8) : [];

  if (subject.length < 3) {
    return NextResponse.json({ ok: false, error: "Subject is too short" }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ ok: false, error: "Message must be at least 10 characters" }, { status: 400 });
  }

  const moderation = scanProhibitedContent(`${subject}\n${message}`, {
    channel: "support_ticket",
    actorRole: user.role,
  });
  if (moderation.matched) {
    await createRiskSignal({
      userId: user.userId,
      signalType: "support_policy_violation",
      severity: moderation.severity,
      reasons: moderation.reasons,
      meta: {
        category,
        shouldBlock: moderation.shouldBlock,
      },
      actorId: user.userId,
      actorRole: user.role,
      req,
    });
    if (moderation.shouldBlock) {
      return NextResponse.json(
        { ok: false, error: "Your request contains prohibited content and was blocked by safety policy." },
        { status: 400 }
      );
    }
  }

  let normalizedBookingId = null;
  if (bookingId) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
    }
    const booking = await Booking.findById(bookingId).select("userId workerId").lean();
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }
    const canUse =
      booking.userId?.toString() === user.userId || booking.workerId?.toString() === user.userId;
    if (!canUse) {
      return NextResponse.json({ ok: false, error: "You can only attach your own booking" }, { status: 403 });
    }
    normalizedBookingId = bookingId;
  }

  const isPanic = category === "panic" || body.panic === true;
  const normalizedCategory = isPanic ? "panic" : ALLOWED_CATEGORIES.includes(category) ? category : "other";
  const normalizedPriority = isPanic ? "critical" : ALLOWED_PRIORITIES.includes(priority) ? priority : "medium";
  const now = new Date();
  const slaMinutes = FIRST_RESPONSE_SLA_MINUTES[normalizedPriority] || FIRST_RESPONSE_SLA_MINUTES.medium;
  const slaFirstResponseDueAt = new Date(now.getTime() + slaMinutes * 60 * 1000);

  const ticket = await SupportTicket.create({
    ticketNo: buildTicketNo(),
    userId: user.userId,
    userRole: user.role,
    bookingId: normalizedBookingId,
    subject,
    category: normalizedCategory,
    priority: normalizedPriority,
    message,
    attachments,
    status: "open",
    slaFirstResponseDueAt,
    lastReplyAt: now,
    auditTrail: [
      {
        action: "ticket_created",
        actorId: user.userId,
        actorRole: user.role,
        note: isPanic ? "Panic-mode ticket created" : "Support ticket created",
        at: now,
      },
    ],
    panicMeta: isPanic
      ? {
          source: "support_form",
          panic: true,
        }
      : {},
  });

  await createNotification({
    userId: user.userId,
    actorId: user.userId,
    type: "system",
    title: "Support ticket created",
    body: `Ticket ${ticket.ticketNo} has been created.`,
    href: "/support",
    meta: { ticketId: ticket._id.toString(), ticketNo: ticket.ticketNo },
  });

  await notifyAdmins({
    actorId: user.userId,
    type: "status",
    title: isPanic ? "PANIC support ticket" : "New support ticket",
    body: `${ticket.ticketNo} | ${ticket.subject} | Priority: ${ticket.priority.toUpperCase()}`,
    href: "/admin/support",
    meta: {
      ticketId: ticket._id.toString(),
      ticketNo: ticket.ticketNo,
      category: ticket.category,
      priority: ticket.priority,
      slaFirstResponseDueAt: ticket.slaFirstResponseDueAt?.toISOString?.() || null,
    },
  });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "support.ticket.create",
    targetType: "support_ticket",
    targetId: ticket._id,
    metadata: {
      ticketNo: ticket.ticketNo,
      category: ticket.category,
      priority: ticket.priority,
      panic: isPanic,
    },
    req,
  });

  const res = NextResponse.json({ ok: true, ticket });
  return applyRefreshCookies(res, refreshedResponse);
}
