import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import BookingTracking from "@/models/BookingTracking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

const TRACKABLE_STATUSES = new Set(["assigned", "onway", "working"]);

function canViewBooking(booking, user) {
  if (!booking || !user) return false;
  if (user.role === "admin") return true;
  if (user.role === "user") return booking.userId?.toString() === user.userId;
  if (user.role === "worker") return booking.workerId?.toString() === user.userId;
  return false;
}

function canSendTracking(booking, user) {
  if (!booking || !user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "worker") return false;
  return booking.workerId?.toString() === user.userId;
}

function parseLocationValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLocationInput(body) {
  const lat = parseLocationValue(body?.lat);
  const lng = parseLocationValue(body?.lng);
  if (lat === null || lng === null) return { error: "lat and lng are required" };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: "Invalid lat/lng range" };
  }

  const accuracy = parseLocationValue(body?.accuracy);
  const speed = parseLocationValue(body?.speed);
  const heading = parseLocationValue(body?.heading);
  const rawRecordedAt = body?.recordedAt ? new Date(body.recordedAt) : new Date();
  const recordedAt = Number.isNaN(rawRecordedAt.getTime()) ? new Date() : rawRecordedAt;

  return {
    value: {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      accuracy: accuracy !== null && accuracy >= 0 ? accuracy : null,
      speed: speed !== null && speed >= 0 ? speed : null,
      heading: heading !== null && heading >= 0 && heading <= 360 ? heading : null,
      recordedAt,
    },
  };
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

  const tracking = await BookingTracking.findOne({ bookingId: id }).lean();
  const res = NextResponse.json({
    ok: true,
    tracking: {
      bookingId: id,
      isLive: Boolean(tracking?.isLive),
      updatedAt: tracking?.updatedAt || null,
      lastLocation: tracking?.lastLocation || null,
      trail: (tracking?.trail || []).slice(-40),
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id).select("userId workerId status").lean();
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  if (!canSendTracking(booking, user)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  if (!TRACKABLE_STATUSES.has(String(booking.status || "")) && user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Live tracking is allowed only in assigned/onway/working status" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { value: location, error } = normalizeLocationInput(body);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  const tracking = await BookingTracking.findOneAndUpdate(
    { bookingId: id },
    {
      $set: {
        userId: booking.userId,
        workerId: booking.workerId,
        isLive: true,
        lastLocation: location,
      },
      $push: {
        trail: {
          $each: [location],
          $slice: -100,
        },
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  const res = NextResponse.json({
    ok: true,
    tracking: {
      bookingId: id,
      isLive: Boolean(tracking?.isLive),
      updatedAt: tracking?.updatedAt || null,
      lastLocation: tracking?.lastLocation || null,
      trail: (tracking?.trail || []).slice(-40),
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function DELETE(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id).select("workerId").lean();
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  if (!canSendTracking(booking, user)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const tracking = await BookingTracking.findOneAndUpdate(
    { bookingId: id },
    { $set: { isLive: false } },
    { new: true }
  ).lean();

  const res = NextResponse.json({
    ok: true,
    tracking: {
      bookingId: id,
      isLive: Boolean(tracking?.isLive),
      updatedAt: tracking?.updatedAt || null,
      lastLocation: tracking?.lastLocation || null,
      trail: (tracking?.trail || []).slice(-40),
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}

