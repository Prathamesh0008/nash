import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { workerOnboardingSchema, parseOrThrow } from "@/lib/validators";

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

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const profile = await WorkerProfile.findOne({ userId: user.userId }).lean();
  const res = NextResponse.json({ ok: true, profile });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(workerOnboardingSchema, await req.json());
    const normalizedPricing = normalizeWorkerPricing(data.pricing || {});
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          profilePhoto: data.profilePhoto,
          galleryPhotos: data.galleryPhotos,
          bio: data.bio,
          skills: data.skills,
          categories: data.categories,
          serviceAreas: data.serviceAreas,
          pricing: normalizedPricing,
          address: data.address,
          docs: data.docs,
          accountStatus: "ONBOARDED",
          verificationStatus: "INCOMPLETE",
        },
      },
      { upsert: true, new: true }
    );
    const res = NextResponse.json({ ok: true, profile });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Invalid onboarding payload" }, { status: error.status || 400 });
  }
}
