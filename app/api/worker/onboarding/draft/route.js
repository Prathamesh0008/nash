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

export async function POST(req) {
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

  const draftPatch = {
    ...(typeof body.bio === "string" ? { bio: body.bio } : {}),
    ...(typeof body.profilePhoto === "string" ? { profilePhoto: body.profilePhoto } : {}),
    ...(Array.isArray(body.galleryPhotos) ? { galleryPhotos: body.galleryPhotos } : {}),
    ...(Array.isArray(body.skills) ? { skills: body.skills } : {}),
    ...(Array.isArray(body.categories) ? { categories: body.categories } : {}),
    ...(Array.isArray(body.serviceAreas) ? { serviceAreas: normalizedServiceAreas } : {}),
    ...(normalizedPricing ? { pricing: normalizedPricing } : {}),
    ...(typeof body.address === "string" ? { address: body.address } : {}),
    ...(typeof body.docs === "object" && body.docs ? { docs: body.docs } : {}),
    accountStatus: "REGISTERED",
    verificationStatus: "INCOMPLETE",
  };

  const profile = await WorkerProfile.findOneAndUpdate({ userId: user.userId }, { $set: draftPatch }, { upsert: true, new: true }).lean();
  const res = NextResponse.json({ ok: true, profile, draft: true });
  return applyRefreshCookies(res, refreshedResponse);
}
