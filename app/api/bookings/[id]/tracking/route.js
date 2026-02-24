import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import BookingTracking from "@/models/BookingTracking";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { haversineKm, pickLatLngFromValue } from "@/lib/geo";

const TRACKABLE_STATUSES = new Set(["assigned", "onway", "working"]);
const TRACKING_STALE_SECONDS = 90;
const MAX_TRAIL_POINTS = 180;
const MAX_RECENT_TRAIL = 40;
const MIN_TRAIL_POINT_DISTANCE_METERS = 8;
const MIN_TRAIL_POINT_INTERVAL_MS = 4000;
const MAX_RECORDED_PAST_MS = 15 * 60 * 1000;
const MAX_RECORDED_FUTURE_MS = 2 * 60 * 1000;

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

function toSpeedKmph(speedMetersPerSecond) {
  const speed = parseLocationValue(speedMetersPerSecond);
  if (speed === null || speed < 0) return null;
  return Number((speed * 3.6).toFixed(1));
}

function toHeadingText(heading) {
  const value = parseLocationValue(heading);
  if (value === null || value < 0 || value > 360) return null;
  const segments = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalized = ((value % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % segments.length;
  return segments[index];
}

function toAgeSec(dateValue) {
  if (!dateValue) return null;
  const ts = new Date(dateValue).getTime();
  if (!Number.isFinite(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 1000));
}

function deriveSpeedFromTrail(trail, lastLocation) {
  const points = [...(Array.isArray(trail) ? trail.slice(-5) : []), lastLocation].filter(Boolean);
  if (points.length < 2) return null;
  const latest = points[points.length - 1];

  for (let i = points.length - 2; i >= 0; i -= 1) {
    const previous = points[i];
    const distanceKm = haversineKm(previous, latest);
    if (distanceKm === null) continue;

    const start = new Date(previous?.recordedAt || 0).getTime();
    const end = new Date(latest?.recordedAt || 0).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);
    if (!Number.isFinite(diffHours) || diffHours <= 0) continue;

    const speedKmph = distanceKm / diffHours;
    if (speedKmph < 1 || speedKmph > 150) continue;
    return Number(speedKmph.toFixed(1));
  }

  return null;
}

function shouldAppendTrailPoint(previousLocation, nextLocation) {
  if (!previousLocation) return true;
  const distanceKm = haversineKm(previousLocation, nextLocation);
  const previousTs = new Date(previousLocation?.recordedAt || 0).getTime();
  const nextTs = new Date(nextLocation?.recordedAt || 0).getTime();
  const diffMs = nextTs - previousTs;

  if (distanceKm === null) return true;
  if (!Number.isFinite(diffMs) || diffMs <= 0) return true;
  if (distanceKm * 1000 >= MIN_TRAIL_POINT_DISTANCE_METERS) return true;
  return diffMs >= MIN_TRAIL_POINT_INTERVAL_MS;
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
  const now = Date.now();
  const rawTime = rawRecordedAt.getTime();
  const boundedTime =
    Number.isNaN(rawTime) || rawTime < now - MAX_RECORDED_PAST_MS || rawTime > now + MAX_RECORDED_FUTURE_MS
      ? now
      : rawTime;
  const recordedAt = new Date(boundedTime);

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

function buildTrackingPayload({ bookingId, booking, tracking }) {
  const trail = Array.isArray(tracking?.trail) ? tracking.trail.slice(-MAX_RECENT_TRAIL) : [];
  const lastLocation = tracking?.lastLocation || null;
  const destination = pickLatLngFromValue(booking?.address || {}) || null;
  const speedKmph = toSpeedKmph(lastLocation?.speed) ?? deriveSpeedFromTrail(trail, lastLocation);
  const distanceToDestinationKm =
    destination && lastLocation ? Number((haversineKm(lastLocation, destination) || 0).toFixed(2)) : null;
  const etaMinutes =
    distanceToDestinationKm !== null && speedKmph !== null && speedKmph >= 3
      ? Math.max(1, Math.round((distanceToDestinationKm / speedKmph) * 60))
      : null;
  const lastUpdateAgeSec = toAgeSec(lastLocation?.recordedAt || tracking?.updatedAt);
  const isStale =
    !tracking?.isLive || lastUpdateAgeSec === null || Number(lastUpdateAgeSec) > TRACKING_STALE_SECONDS;

  return {
    bookingId,
    isLive: Boolean(tracking?.isLive),
    updatedAt: tracking?.updatedAt || null,
    lastLocation,
    trail,
    summary: {
      trailPoints: Array.isArray(tracking?.trail) ? tracking.trail.length : 0,
      lastUpdateAgeSec,
      isStale,
      speedKmph,
      headingText: toHeadingText(lastLocation?.heading),
      distanceToDestinationKm,
      etaMinutes,
      destination,
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

  const booking = await Booking.findById(id).select("userId workerId status address.lat address.lng address.location").lean();
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  if (!canViewBooking(booking, user)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const tracking = await BookingTracking.findOne({ bookingId: id }).lean();
  const res = NextResponse.json({
    ok: true,
    tracking: buildTrackingPayload({ bookingId: id, booking, tracking }),
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

  const booking = await Booking.findById(id).select("userId workerId status address.lat address.lng address.location").lean();
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

  const previous = await BookingTracking.findOne({ bookingId: id }).select("lastLocation").lean();
  const shouldAppend = shouldAppendTrailPoint(previous?.lastLocation || null, location);
  const update = {
    $set: {
      userId: booking.userId,
      workerId: booking.workerId,
      isLive: true,
      lastLocation: location,
    },
  };
  if (shouldAppend) {
    update.$push = {
      trail: {
        $each: [location],
        $slice: -MAX_TRAIL_POINTS,
      },
    };
  }

  const tracking = await BookingTracking.findOneAndUpdate(
    { bookingId: id },
    update,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  const res = NextResponse.json({
    ok: true,
    tracking: buildTrackingPayload({ bookingId: id, booking, tracking }),
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

  const booking = await Booking.findById(id).select("userId workerId status address.lat address.lng address.location").lean();
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  if (!canSendTracking(booking, user)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const tracking = await BookingTracking.findOneAndUpdate(
    { bookingId: id },
    { $set: { isLive: false } },
    { new: true }
  ).lean();

  const res = NextResponse.json({
    ok: true,
    tracking: buildTrackingPayload({ bookingId: id, booking, tracking }),
  });
  return applyRefreshCookies(res, refreshedResponse);
}
