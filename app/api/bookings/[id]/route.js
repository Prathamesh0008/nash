import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";
import RescheduleLog from "@/models/RescheduleLog";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id).lean();
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });

  const canAccess =
    user.role === "admin" ||
    booking.userId?.toString() === user.userId ||
    booking.workerId?.toString() === user.userId;

  if (!canAccess) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const [service, customer, worker, rescheduleLogs] = await Promise.all([
    Service.findById(booking.serviceId).select("title slug category").lean(),
    User.findById(booking.userId).select("name email phone").lean(),
    booking.workerId ? User.findById(booking.workerId).select("name email phone").lean() : null,
    RescheduleLog.find({ bookingId: booking._id }).sort({ createdAt: -1 }).lean(),
  ]);

  const res = NextResponse.json({ ok: true, booking: { ...booking, service, customer, worker, rescheduleLogs } });
  return applyRefreshCookies(res, refreshedResponse);
}
