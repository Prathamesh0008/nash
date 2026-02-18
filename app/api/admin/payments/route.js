import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req) {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "").trim();
  const provider = (searchParams.get("provider") || "").trim();
  const type = (searchParams.get("type") || "").trim();
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 500), 1), 1000);

  const filter = {};
  if (status) filter.status = status;
  if (provider) filter.provider = provider;
  if (type) filter.type = type;

  const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const userIds = [...new Set(payments.map((payment) => payment.userId?.toString()).filter(Boolean))];
  const bookingIds = [...new Set(payments.map((payment) => payment.bookingId?.toString()).filter(Boolean))];

  const [users, bookings] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("name email phone").lean(),
    Booking.find({ _id: { $in: bookingIds } }).select("status slotTime").lean(),
  ]);

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));
  const bookingMap = new Map(bookings.map((booking) => [booking._id.toString(), booking]));

  const rows = payments
    .map((payment) => ({
      ...payment,
      user: userMap.get(payment.userId?.toString()) || null,
      booking: bookingMap.get(payment.bookingId?.toString()) || null,
    }))
    .filter((payment) => {
      if (!q) return true;
      const userText = `${payment.user?.name || ""} ${payment.user?.email || ""}`.toLowerCase();
      const bookingText = String(payment.bookingId || "").toLowerCase();
      const providerText = String(payment.provider || "").toLowerCase();
      const paymentText = String(payment.providerPaymentId || "").toLowerCase();
      return (
        userText.includes(q) ||
        bookingText.includes(q) ||
        providerText.includes(q) ||
        paymentText.includes(q)
      );
    });

  const summary = rows.reduce(
    (acc, payment) => {
      const s = payment.status || "created";
      const t = payment.type || "booking";
      const amount = Number(payment.amount || 0);
      acc.totalPayments += 1;
      acc.totalAmount += amount;
      acc.byStatus[s] = (acc.byStatus[s] || 0) + 1;
      acc.byType[t] = (acc.byType[t] || 0) + 1;
      if (s === "paid") acc.paidAmount += amount;
      if (s === "refunded") acc.refundedAmount += amount;
      return acc;
    },
    {
      totalPayments: 0,
      totalAmount: 0,
      paidAmount: 0,
      refundedAmount: 0,
      byStatus: { created: 0, paid: 0, failed: 0, refunded: 0 },
      byType: {},
    }
  );

  const res = NextResponse.json({ ok: true, payments: rows, summary });
  return applyRefreshCookies(res, refreshedResponse);
}
