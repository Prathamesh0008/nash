import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { signTrackingToken } from "@/lib/trackingToken";

const TRACKABLE_STATUSES = new Set(["assigned", "onway", "working"]);

function canViewBooking(booking, user) {
  if (!booking || !user) return false;
  if (user.role === "admin") return true;
  if (user.role === "user") return booking.userId?.toString() === user.userId;
  if (user.role === "worker") return booking.workerId?.toString() === user.userId;
  return false;
}

export async function GET(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id).select("userId workerId status").lean();
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  if (!canViewBooking(booking, user)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const canSend =
    user.role === "admin" ||
    (user.role === "worker" && booking.workerId?.toString() === user.userId);

  const isTrackableStatus = TRACKABLE_STATUSES.has(String(booking.status || ""));
  const ttlSeconds = canSend ? 60 * 90 : 60 * 60;
  const token = signTrackingToken(
    {
      bookingId: id,
      userId: user.userId,
      role: user.role,
    },
    { ttlSeconds }
  );

  const res = NextResponse.json({
    ok: true,
    token,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    permissions: {
      canView: true,
      canSend,
      isTrackableStatus,
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}

