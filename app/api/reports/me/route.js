import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import Booking from "@/models/Booking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const filter =
    user.role === "admin"
      ? {}
      : {
          $or: [{ reporterId: user.userId }, { targetId: user.userId }],
        };

  const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  const bookingIds = [...new Set(reports.map((r) => r.bookingId?.toString()).filter(Boolean))];
  const bookings = await Booking.find({ _id: { $in: bookingIds } }).select("status slotTime").lean();
  const bookingMap = new Map(bookings.map((b) => [b._id.toString(), b]));

  const rows = reports.map((report) => ({
    ...report,
    booking: bookingMap.get(report.bookingId?.toString()) || null,
  }));

  const res = NextResponse.json({ ok: true, reports: rows });
  return applyRefreshCookies(res, refreshedResponse);
}