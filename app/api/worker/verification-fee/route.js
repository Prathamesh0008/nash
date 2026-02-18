import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import Payment from "@/models/Payment";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

const DEFAULT_VERIFICATION_FEE = Number(process.env.VERIFICATION_FEE || 299);

function hasMinimumOnboarding(profile) {
  if (!profile) return false;
  const hasProfilePhoto = Boolean(String(profile.profilePhoto || "").trim());
  const hasGallery = Array.isArray(profile.galleryPhotos) && profile.galleryPhotos.filter(Boolean).length >= 3;
  const hasBio = String(profile.bio || "").trim().length >= 20;
  const hasSkills = Array.isArray(profile.skills) && profile.skills.filter(Boolean).length >= 1;
  const hasCategories = Array.isArray(profile.categories) && profile.categories.filter(Boolean).length >= 1;
  const hasServiceArea = Array.isArray(profile.serviceAreas) && profile.serviceAreas.length >= 1;
  const hasAddress = Boolean(String(profile.address || "").trim());
  const hasDocs = Boolean(String(profile?.docs?.idProof || "").trim()) && Boolean(String(profile?.docs?.selfie || "").trim());

  return (
    hasProfilePhoto &&
    hasGallery &&
    hasBio &&
    hasSkills &&
    hasCategories &&
    hasServiceArea &&
    hasAddress &&
    hasDocs
  );
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const profile = await WorkerProfile.findOne({ userId: user.userId });
  if (!profile) return NextResponse.json({ ok: false, error: "Worker profile not found" }, { status: 404 });

  if (profile.verificationFeePaid) {
    return NextResponse.json({ ok: true, message: "Verification fee already paid", profile });
  }
  if (!hasMinimumOnboarding(profile)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Complete onboarding details (photos, bio, skills, categories, area, address, ID proof, selfie) before paying verification fee.",
      },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount || DEFAULT_VERIFICATION_FEE);

  const payment = await Payment.create({
    userId: user.userId,
    workerId: user.userId,
    type: "verification",
    amount,
    status: "paid",
    provider: "demo",
    providerPaymentId: `demo_verify_${Date.now()}`,
  });

  const now = new Date();
  const hasSubmittedDocs = Boolean(profile?.docs?.idProof && profile?.docs?.selfie);
  const shouldEnterReviewQueue = hasSubmittedDocs;

  profile.verificationFeePaid = true;
  profile.verificationFeeAmount = amount;
  profile.verificationFeePaidAt = now;
  profile.verificationStatus = shouldEnterReviewQueue ? "PENDING_REVIEW" : "INCOMPLETE";
  profile.accountStatus = hasSubmittedDocs ? "ONBOARDED" : profile.accountStatus || "REGISTERED";
  profile.kyc = profile.kyc || {};
  profile.kyc.queueStatus = shouldEnterReviewQueue ? "pending_review" : "not_submitted";
  profile.kyc.submittedAt = shouldEnterReviewQueue ? profile.kyc.submittedAt || now : profile.kyc.submittedAt || null;
  profile.kyc.reviewSlaDueAt = shouldEnterReviewQueue ? new Date(now.getTime() + 48 * 60 * 60 * 1000) : null;
  profile.kyc.rejectionReason = "";
  profile.kyc.reuploadRequestedAt = null;
  profile.kyc.history = Array.isArray(profile.kyc.history) ? profile.kyc.history : [];
  if (shouldEnterReviewQueue) {
    profile.kyc.history.push({
      action: "submitted",
      reason: "Verification fee paid and documents sent to KYC queue",
      actorId: user.userId,
      at: now,
    });
  }
  await profile.save();

  const res = NextResponse.json({ ok: true, payment, profile });
  return applyRefreshCookies(res, refreshedResponse);
}
