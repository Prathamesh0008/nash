import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { isValidLatLng, toGeoPoint } from "@/lib/geo";

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  const addressId = String(body?.addressId || "").trim();

  if (!isValidLatLng(lat, lng)) {
    return NextResponse.json({ ok: false, error: "Invalid latitude/longitude" }, { status: 400 });
  }

  const me = await User.findById(user.userId);
  if (!me) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  if (!Array.isArray(me.addresses) || me.addresses.length === 0) {
    return NextResponse.json({ ok: false, error: "No addresses found. Add an address first." }, { status: 400 });
  }

  let target = null;
  if (addressId) {
    target = me.addresses.id(addressId) || null;
  }
  if (!target) {
    target = me.addresses.find((row) => row?.isDefault) || me.addresses[0];
  }
  if (!target) {
    return NextResponse.json({ ok: false, error: "Address not found" }, { status: 404 });
  }

  target.lat = lat;
  target.lng = lng;
  target.location = toGeoPoint(lat, lng);
  await me.save();

  const res = NextResponse.json({
    ok: true,
    address: {
      _id: target._id,
      city: target.city,
      pincode: target.pincode,
      lat: target.lat,
      lng: target.lng,
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
