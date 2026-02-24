import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const filter =
    user.role === "worker"
      ? { workerId: user.userId }
      : user.role === "user"
        ? { userId: user.userId }
        : {};

  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  const serviceIds = [...new Set(bookings.map((b) => b.serviceId?.toString()).filter(Boolean))];
  const userIds = [...new Set(bookings.flatMap((b) => [b.userId?.toString(), b.workerId?.toString()]).filter(Boolean))];
  const sourceBookingIds = [...new Set(bookings.map((b) => b.sourceBookingId?.toString()).filter(Boolean))];

  const [services, people, sourceBookings] = await Promise.all([
    Service.find({ _id: { $in: serviceIds } }).select("title slug category").lean(),
    User.find({ _id: { $in: userIds } }).select("name email").lean(),
    sourceBookingIds.length > 0
      ? Booking.find({ _id: { $in: sourceBookingIds } })
          .select("_id slotTime status createdAt")
          .lean()
      : [],
  ]);

  const serviceMap = new Map(services.map((s) => [s._id.toString(), s]));
  const userMap = new Map(people.map((p) => [p._id.toString(), p]));
  const sourceMap = new Map(sourceBookings.map((row) => [row._id.toString(), row]));

  const rows = bookings.map((booking) => ({
    ...booking,
    service: serviceMap.get(booking.serviceId?.toString()) || null,
    customer: userMap.get(booking.userId?.toString()) || null,
    worker: userMap.get(booking.workerId?.toString()) || null,
    sourceBooking: sourceMap.get(booking.sourceBookingId?.toString()) || null,
  }));

  const res = NextResponse.json({ ok: true, bookings: rows });
  return applyRefreshCookies(res, refreshedResponse);
}
