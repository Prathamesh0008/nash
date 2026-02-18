import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { normalizeServiceAreaList } from "@/lib/geo";

function normalizeWorkerPricing(pricing = {}) {
  const basePrice = Math.max(0, Number(pricing?.basePrice || 0));
  const extraServices = Array.isArray(pricing?.extraServices)
    ? pricing.extraServices
        .map((row) => ({
          title: String(row?.title || "").trim(),
          price: Math.max(0, Number(row?.price || 0)),
        }))
        .filter((row) => row.title)
        .slice(0, 30)
    : [];
  return {
    basePrice,
    extraServices,
    currency: "INR",
  };
}

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const normalizedServiceAreas = Array.isArray(body.serviceAreas)
    ? normalizeServiceAreaList(body.serviceAreas)
    : null;
  const normalizedPricing = typeof body.pricing === "object" && body.pricing
    ? normalizeWorkerPricing(body.pricing)
    : null;
  const patch = {
    ...(typeof body.bio === "string" ? { bio: body.bio } : {}),
    ...(typeof body.gender === "string" ? { gender: body.gender } : {}),
    ...(Array.isArray(body.skills) ? { skills: body.skills } : {}),
    ...(Array.isArray(body.categories) ? { categories: body.categories } : {}),
    ...(Array.isArray(body.serviceAreas) ? { serviceAreas: normalizedServiceAreas } : {}),
    ...(normalizedPricing ? { pricing: normalizedPricing } : {}),
    ...(typeof body.address === "string" ? { address: body.address } : {}),
    ...(typeof body.profilePhoto === "string" ? { profilePhoto: body.profilePhoto } : {}),
    ...(Array.isArray(body.galleryPhotos) ? { galleryPhotos: body.galleryPhotos } : {}),
    ...(typeof body.docs === "object" && body.docs ? { docs: body.docs } : {}),
  };

  const profile = await WorkerProfile.findOneAndUpdate({ userId: user.userId }, { $set: patch }, { new: true, upsert: true }).lean();
  const res = NextResponse.json({ ok: true, profile });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const profile = await WorkerProfile.findOne({ userId: user.userId }).lean();
  const res = NextResponse.json({ ok: true, profile });
  return applyRefreshCookies(res, refreshedResponse);
}
