import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req) {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "").trim();
  const paymentStatus = (searchParams.get("paymentStatus") || "").trim();
  const assignment = (searchParams.get("assignment") || "").trim();
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 300), 1), 500);

  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (assignment === "assigned") {
    filter.workerId = { $ne: null };
  } else if (assignment === "unassigned") {
    filter.workerId = null;
  }

  const orders = await Booking.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const serviceIds = [...new Set(orders.map((o) => o.serviceId?.toString()).filter(Boolean))];
  const userIds = [...new Set(orders.flatMap((o) => [o.userId?.toString(), o.workerId?.toString()]).filter(Boolean))];

  const [services, users] = await Promise.all([
    Service.find({ _id: { $in: serviceIds } }).select("title").lean(),
    User.find({ _id: { $in: userIds } }).select("name email").lean(),
  ]);

  const serviceMap = new Map(services.map((s) => [s._id.toString(), s]));
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const rows = orders.map((order) => ({
    ...order,
    service: serviceMap.get(order.serviceId?.toString()) || null,
    customer: userMap.get(order.userId?.toString()) || null,
    worker: userMap.get(order.workerId?.toString()) || null,
  }))
    .filter((order) => {
      if (!q) return true;
      const service = (order.service?.title || "").toLowerCase();
      const customer = (order.customer?.name || order.customer?.email || "").toLowerCase();
      const worker = (order.worker?.name || order.worker?.email || "").toLowerCase();
      const bookingId = String(order._id || "").toLowerCase();
      const city = String(order.address?.city || "").toLowerCase();
      const pincode = String(order.address?.pincode || "").toLowerCase();
      return (
        service.includes(q) ||
        customer.includes(q) ||
        worker.includes(q) ||
        bookingId.includes(q) ||
        city.includes(q) ||
        pincode.includes(q)
      );
    });

  const summary = rows.reduce(
    (acc, order) => {
      const statusKey = order.status || "confirmed";
      const payKey = order.paymentStatus || "unpaid";
      const total = Number(order.priceBreakup?.total || 0);
      acc.totalOrders += 1;
      acc.byStatus[statusKey] = (acc.byStatus[statusKey] || 0) + 1;
      acc.byPaymentStatus[payKey] = (acc.byPaymentStatus[payKey] || 0) + 1;
      acc.grossAmount += total;
      return acc;
    },
    {
      totalOrders: 0,
      grossAmount: 0,
      byStatus: { confirmed: 0, assigned: 0, onway: 0, working: 0, completed: 0, cancelled: 0 },
      byPaymentStatus: { unpaid: 0, paid: 0, refunded: 0 },
    }
  );

  const res = NextResponse.json({ ok: true, orders: rows, summary });
  return applyRefreshCookies(res, refreshedResponse);
}
