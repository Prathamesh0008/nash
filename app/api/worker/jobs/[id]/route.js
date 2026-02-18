import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid job id" }, { status: 400 });
  }

  const booking = await Booking.findById(id).lean();
  if (!booking || booking.workerId?.toString() !== user.userId) {
    return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
  }

  const [service, customer] = await Promise.all([
    Service.findById(booking.serviceId).select("title category").lean(),
    User.findById(booking.userId).select("name phone email").lean(),
  ]);

  const res = NextResponse.json({ ok: true, job: { ...booking, service, customer } });
  return applyRefreshCookies(res, refreshedResponse);
}