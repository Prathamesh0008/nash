import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { autoReassignBooking } from "@/lib/reassign";
import { writeAuditLog } from "@/lib/audit";

const USER_REASSIGNABLE = new Set(["assigned", "onway"]);
const WORKER_REASSIGNABLE = new Set(["assigned", "onway"]);

function safeText(value, max = 220) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id).select("userId workerId status").lean();
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }

  if (user.role === "user") {
    if (String(booking.userId) !== user.userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    if (!USER_REASSIGNABLE.has(String(booking.status || ""))) {
      return NextResponse.json({ ok: false, error: "Reassign is only available for assigned/onway bookings" }, { status: 400 });
    }
  }

  if (user.role === "worker") {
    if (!booking.workerId || String(booking.workerId) !== user.userId) {
      return NextResponse.json({ ok: false, error: "Not your job" }, { status: 403 });
    }
    if (!WORKER_REASSIGNABLE.has(String(booking.status || ""))) {
      return NextResponse.json({ ok: false, error: "Reassign is only available for assigned/onway jobs" }, { status: 400 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const reason = safeText(body.reason || "");
  const note = safeText(body.note || "");

  try {
    const result = await autoReassignBooking({
      bookingId: id,
      actorId: user.userId,
      actorRole: user.role,
      reason,
      note,
      allowUnassign: true,
    });

    await writeAuditLog({
      actorId: user.userId,
      actorRole: user.role,
      action: "booking.reassign.auto",
      targetType: "booking",
      targetId: id,
      metadata: {
        reason,
        note,
        previousWorkerId: result.previousWorkerId,
        nextWorkerId: result.nextWorkerId,
        reassigned: result.reassigned,
      },
      req,
    });

    const res = NextResponse.json({
      ok: true,
      booking: result.booking,
      reassigned: result.reassigned,
      nextWorkerId: result.nextWorkerId,
      previousWorkerId: result.previousWorkerId,
      message: result.reassigned
        ? "Booking reassigned successfully"
        : "No replacement worker found right now. Booking moved back to confirmed.",
    });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to auto reassign booking" },
      { status: error.status || 400 }
    );
  }
}
