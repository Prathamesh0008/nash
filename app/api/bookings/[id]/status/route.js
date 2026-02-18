import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import WorkerProfile from "@/models/WorkerProfile";
import { bookingStatusSchema, parseOrThrow } from "@/lib/validators";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notify";

const transitions = {
  confirmed: ["assigned", "cancelled"],
  assigned: ["onway", "cancelled"],
  onway: ["working", "cancelled"],
  working: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function PATCH(req, context) {
  await dbConnect();

  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  try {
    const data = parseOrThrow(bookingStatusSchema, await req.json());
    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });

    if (user.role === "worker" && booking.workerId?.toString() !== user.userId) {
      return NextResponse.json({ ok: false, error: "Not your job" }, { status: 403 });
    }

    const allowed = transitions[booking.status] || [];
    if (!allowed.includes(data.status)) {
      return NextResponse.json({ ok: false, error: `Invalid transition: ${booking.status} -> ${data.status}` }, { status: 400 });
    }

    booking.status = data.status;

    booking.statusLogs.push({
      status: data.status,
      actorRole: user.role,
      actorId: user.userId,
      note: data.note || "",
    });

    if (data.status === "completed") {
      booking.reportWindowEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      if (booking.workerId) {
        const payoutCredit = Math.round(Number(booking.priceBreakup?.total || 0) * 0.8);
        await WorkerProfile.updateOne(
          { userId: booking.workerId },
          {
            $inc: {
              jobsCompleted: 1,
              payoutWalletBalance: payoutCredit,
              totalEarnings: payoutCredit,
            },
          }
        );
      }
    }

    await booking.save();

    if (booking.userId && booking.userId.toString() !== user.userId) {
      await createNotification({
        userId: booking.userId,
        actorId: user.userId,
        type: "status",
        title: `Booking status updated to ${data.status}`,
        body: data.note || "Track your booking progress.",
        href: `/orders/${booking._id}`,
        meta: { bookingId: booking._id.toString(), status: data.status },
      });
    }

    if (
      booking.workerId &&
      booking.workerId.toString() !== user.userId &&
      user.role === "admin"
    ) {
      await createNotification({
        userId: booking.workerId,
        actorId: user.userId,
        type: "status",
        title: `Booking status set to ${data.status} by admin`,
        body: data.note || "Please check the order details.",
        href: `/worker/jobs/${booking._id}`,
        meta: { bookingId: booking._id.toString(), status: data.status },
      });
    }

    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "booking.status.update",
      targetType: "booking",
      targetId: booking._id,
      metadata: { to: data.status, note: data.note || "" },
      req,
    });

    const res = NextResponse.json({ ok: true, booking });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to update status" }, { status: error.status || 400 });
  }
}
