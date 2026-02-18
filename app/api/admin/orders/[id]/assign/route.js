import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import WorkerProfile from "@/models/WorkerProfile";
import Conversation from "@/models/Conversation";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { isWorkerAvailableForSlot } from "@/lib/availability";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const workerId = body.workerId;
  const note = String(body.note || "").trim();
  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  const worker = await WorkerProfile.findOne({
    userId: workerId,
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
  }).lean();
  if (!worker) {
    return NextResponse.json({ ok: false, error: "Worker not verified" }, { status: 400 });
  }
  if (!worker.isOnline) {
    return NextResponse.json({ ok: false, error: "Worker is offline" }, { status: 409 });
  }

  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });

  if (!isWorkerAvailableForSlot(worker, booking.slotTime)) {
    return NextResponse.json({ ok: false, error: "Worker is not available for this slot as per schedule" }, { status: 409 });
  }

  const slotConflict = await Booking.findOne({
    _id: { $ne: booking._id },
    workerId,
    slotTime: booking.slotTime,
    status: { $in: ["assigned", "onway", "working", "confirmed"] },
  }).lean();
  if (slotConflict) {
    return NextResponse.json({ ok: false, error: "Worker already has an active booking on this slot" }, { status: 409 });
  }

  booking.workerId = workerId;
  booking.status = "assigned";
  booking.assignmentMode = "manual";
  booking.assignmentReason = note || "Assigned by admin";
  booking.statusLogs.push({
    status: "assigned",
    actorRole: "admin",
    actorId: user.userId,
    note: note || "Assigned by admin",
  });
  await booking.save();

  const conversation = await Conversation.findOneAndUpdate(
    {
      bookingId: booking._id,
      userId: booking.userId,
      workerUserId: workerId,
    },
    {
      $setOnInsert: {
        bookingId: booking._id,
        userId: booking.userId,
        workerUserId: workerId,
      },
      $set: { lastMessageAt: new Date() },
    },
    { upsert: true, new: true }
  ).lean();

  if (!booking.conversationId) {
    booking.conversationId = conversation._id;
    await booking.save();
  }

  await createNotification({
    userId: booking.userId,
    actorId: user.userId,
    type: "status",
    title: "Worker assigned to your booking",
    body: note || "Your booking has been assigned by admin.",
    href: `/orders/${booking._id}`,
    meta: { bookingId: booking._id.toString(), workerId },
  });

  await createNotification({
    userId: workerId,
    actorId: user.userId,
    type: "status",
    title: "New job assigned by admin",
    body: "Please check your worker jobs panel.",
    href: `/worker/jobs/${booking._id}`,
    meta: { bookingId: booking._id.toString() },
  });

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "order.assign",
    targetType: "booking",
    targetId: booking._id,
    metadata: { workerId, note },
    req,
  });

  const res = NextResponse.json({ ok: true, booking });
  return applyRefreshCookies(res, refreshedResponse);
}
