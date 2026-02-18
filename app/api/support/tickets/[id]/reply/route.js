import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupportTicket from "@/models/SupportTicket";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notify";

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

  ticket.lastReplyAt = new Date();
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

  const res = NextResponse.json({ ok: true, ticket });
  return applyRefreshCookies(res, refreshedResponse);
}
