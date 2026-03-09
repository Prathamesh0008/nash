import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import Payment from "@/models/Payment";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { runKycAssessment } from "@/lib/kycAssessment";
import { createRiskSignal } from "@/lib/riskSignals";
import ConsentEvidenceLog from "@/models/ConsentEvidenceLog";

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
  const kycAssessment = shouldEnterReviewQueue
    ? runKycAssessment({
        idProofUrl: profile?.docs?.idProof || "",
        selfieUrl: profile?.docs?.selfie || "",
      })
    : null;
  const reviewSlaHours = shouldEnterReviewQueue ? Number(kycAssessment?.recommendedSlaHours || 48) : null;

  profile.verificationFeePaid = true;
  profile.verificationFeeAmount = amount;
  profile.verificationFeePaidAt = now;
  profile.verificationStatus = shouldEnterReviewQueue ? "PENDING_REVIEW" : "INCOMPLETE";
  profile.accountStatus = hasSubmittedDocs ? "ONBOARDED" : profile.accountStatus || "REGISTERED";
  profile.kyc = profile.kyc || {};
  profile.kyc.queueStatus = shouldEnterReviewQueue ? "pending_review" : "not_submitted";
  profile.kyc.reviewPriority = shouldEnterReviewQueue ? kycAssessment.reviewPriority || "normal" : "normal";
  profile.kyc.reviewSlaHours = reviewSlaHours;
  profile.kyc.submittedAt = shouldEnterReviewQueue ? profile.kyc.submittedAt || now : profile.kyc.submittedAt || null;
  profile.kyc.reviewSlaDueAt = shouldEnterReviewQueue && reviewSlaHours ? new Date(now.getTime() + reviewSlaHours * 60 * 60 * 1000) : null;
  profile.kyc.rejectionReason = "";
  profile.kyc.reuploadRequestedAt = null;
  profile.kyc.assessment = shouldEnterReviewQueue ? kycAssessment : profile.kyc.assessment || {};
  profile.kyc.history = Array.isArray(profile.kyc.history) ? profile.kyc.history : [];
  if (shouldEnterReviewQueue) {
    profile.kyc.history.push({
      action: "submitted",
      reason: `Verification fee paid and documents sent to KYC queue | risk:${kycAssessment.riskLevel} auto:${kycAssessment.autoDecision}`,
      actorId: user.userId,
      at: now,
    });
  }
  await profile.save();

  if (shouldEnterReviewQueue) {
    await ConsentEvidenceLog.create({
      userId: user.userId,
      userRole: user.role,
      evidenceType: "kyc_age_check",
      accepted: !Array.isArray(kycAssessment.flags) || !kycAssessment.flags.includes("possible_underage"),
      statement: "Verification fee flow captured KYC age/consent evidence.",
      source: "onboarding_kyc",
      metadata: {
        riskLevel: kycAssessment.riskLevel,
        autoDecision: kycAssessment.autoDecision,
        flags: kycAssessment.flags || [],
      },
      ip: req?.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim?.() || "",
      userAgent: req?.headers?.get?.("user-agent") || "",
    });
  }

  if (shouldEnterReviewQueue && ["high", "critical"].includes(kycAssessment.riskLevel)) {
    await createRiskSignal({
      userId: user.userId,
      signalType: "kyc_risk",
      severity: kycAssessment.riskLevel,
      reasons: Array.isArray(kycAssessment.flags) ? kycAssessment.flags : ["kyc_risk_detected"],
      meta: {
        verificationFeePaid: true,
        queueStatus: profile.kyc.queueStatus,
      },
      actorId: user.userId,
      actorRole: user.role,
      req,
    });
  }

  const res = NextResponse.json({ ok: true, payment, profile, kycAssessment });
  return applyRefreshCookies(res, refreshedResponse);
}
