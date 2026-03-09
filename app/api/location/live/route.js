import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { isValidLatLng, toGeoPoint } from "@/lib/geo";

const MAX_PAST_MS = 20 * 60 * 1000;
const MAX_FUTURE_MS = 2 * 60 * 1000;

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeRecordedAt(input) {
  const now = Date.now();
  const parsed = input ? new Date(input).getTime() : now;
  if (!Number.isFinite(parsed)) return new Date(now);
  if (parsed < now - MAX_PAST_MS || parsed > now + MAX_FUTURE_MS) return new Date(now);
  return new Date(parsed);
}

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const lat = toNumber(body?.lat);
  const lng = toNumber(body?.lng);
  const accuracy = toNumber(body?.accuracy);
  const speed = toNumber(body?.speed);
  const heading = toNumber(body?.heading);
  const recordedAt = normalizeRecordedAt(body?.recordedAt);

  if (!isValidLatLng(lat, lng)) {
    return NextResponse.json({ ok: false, error: "Invalid latitude/longitude" }, { status: 400 });
  }

  const locationPatch = {
    "currentLocation.lat": Number(lat.toFixed(6)),
    "currentLocation.lng": Number(lng.toFixed(6)),
    "currentLocation.accuracy": accuracy !== null && accuracy >= 0 ? accuracy : null,
    "currentLocation.speed": speed !== null && speed >= 0 ? speed : null,
    "currentLocation.heading": heading !== null && heading >= 0 && heading <= 360 ? heading : null,
    "currentLocation.recordedAt": recordedAt,
    "currentLocation.location": toGeoPoint(lat, lng),
    lastSeenAt: new Date(),
  };

  const me = await User.findByIdAndUpdate(user.userId, { $set: locationPatch }, { new: true }).select("_id role").lean();
  if (!me) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  if (user.role === "worker") {
    await WorkerProfile.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          "currentLocation.lat": Number(lat.toFixed(6)),
          "currentLocation.lng": Number(lng.toFixed(6)),
          "currentLocation.accuracy": accuracy !== null && accuracy >= 0 ? accuracy : null,
          "currentLocation.speed": speed !== null && speed >= 0 ? speed : null,
          "currentLocation.heading": heading !== null && heading >= 0 && heading <= 360 ? heading : null,
          "currentLocation.recordedAt": recordedAt,
          "currentLocation.location": toGeoPoint(lat, lng),
          lastActiveAt: new Date(),
        },
      },
      { new: false }
    ).lean();
  }

  const res = NextResponse.json({
    ok: true,
    location: {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      recordedAt: recordedAt.toISOString(),
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
