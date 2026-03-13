import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { workerOnboardingSchema, parseOrThrow } from "@/lib/validators";
import { normalizeServiceAreaList } from "@/lib/geo";
import { runKycAssessment } from "@/lib/kycAssessment";
import { createRiskSignal } from "@/lib/riskSignals";
import ConsentEvidenceLog from "@/models/ConsentEvidenceLog";

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
    currency: "EUR",
  };
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(workerOnboardingSchema, await req.json());
    const normalizedServiceAreas = normalizeServiceAreaList(data.serviceAreas || []);
    const normalizedPricing = normalizeWorkerPricing(data.pricing || {});
    const existingProfile = await WorkerProfile.findOne({ userId: user.userId }).lean();
    const isResubmission = ["REJECTED", "INCOMPLETE"].includes(existingProfile?.verificationStatus || "");
    const kycAssessment = runKycAssessment({
      idProofUrl: data?.docs?.idProof || "",
      selfieUrl: data?.docs?.selfie || "",
    });
    const nextQueueStatus = existingProfile?.verificationFeePaid ? "pending_review" : "not_submitted";
    const nextVerificationStatus = existingProfile?.verificationFeePaid ? "PENDING_REVIEW" : "INCOMPLETE";
    const now = new Date();
    const reviewSlaHours = existingProfile?.verificationFeePaid ? Number(kycAssessment?.recommendedSlaHours || 48) : null;

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          gender: data.gender || existingProfile?.gender || "other",
          profilePhoto: data.profilePhoto,
          galleryPhotos: data.galleryPhotos,
          bio: data.bio,
          skills: data.skills,
          categories: data.categories,
          serviceAreas: normalizedServiceAreas,
          pricing: normalizedPricing,
          address: data.address,
          docs: data.docs,
          accountStatus: "ONBOARDED",
          verificationStatus: nextVerificationStatus,
          "kyc.queueStatus": nextQueueStatus,
          "kyc.reviewPriority": kycAssessment.reviewPriority || "normal",
          "kyc.reviewSlaHours": reviewSlaHours,
          "kyc.submittedAt": now,
          "kyc.reviewSlaDueAt":
            existingProfile?.verificationFeePaid && reviewSlaHours
              ? new Date(now.getTime() + reviewSlaHours * 60 * 60 * 1000)
              : null,
          "kyc.reviewedAt": null,
          "kyc.reviewedBy": null,
          "kyc.rejectionReason": "",
          "kyc.reuploadRequestedAt": null,
          "kyc.docsVersion": Number(existingProfile?.kyc?.docsVersion || 1) + (isResubmission ? 1 : 0),
          "kyc.assessment": kycAssessment,
        },
        $push: {
          "kyc.history": {
            action: isResubmission ? "resubmitted" : "submitted",
            reason: isResubmission
              ? `Worker re-uploaded/re-submitted documents | risk:${kycAssessment.riskLevel} auto:${kycAssessment.autoDecision}`
              : `Worker submitted onboarding documents | risk:${kycAssessment.riskLevel} auto:${kycAssessment.autoDecision}`,
            actorId: user.userId,
            at: now,
          },
        },
      },
      { upsert: true, new: true }
    );

    const nextSteps = profile.verificationFeePaid
      ? "Your profile is pending admin review"
      : "Please pay verification fee to send for admin review";

    await ConsentEvidenceLog.create({
      userId: user.userId,
      userRole: user.role,
      evidenceType: "kyc_age_check",
      accepted: !Array.isArray(kycAssessment.flags) || !kycAssessment.flags.includes("possible_underage"),
      statement: "KYC document age evidence processed via OCR+face-match workflow.",
      source: "onboarding_kyc",
      metadata: {
        riskLevel: kycAssessment.riskLevel,
        autoDecision: kycAssessment.autoDecision,
        flags: kycAssessment.flags || [],
      },
      ip: req?.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim?.() || "",
      userAgent: req?.headers?.get?.("user-agent") || "",
    });

    if (["high", "critical"].includes(kycAssessment.riskLevel)) {
      await createRiskSignal({
        userId: user.userId,
        signalType: "kyc_risk",
        severity: kycAssessment.riskLevel,
        reasons: Array.isArray(kycAssessment.flags) ? kycAssessment.flags : ["kyc_risk_detected"],
        meta: {
          queueStatus: nextQueueStatus,
          autoDecision: kycAssessment.autoDecision,
          reviewPriority: kycAssessment.reviewPriority,
        },
        actorId: user.userId,
        actorRole: user.role,
        req,
      });
    }

    const res = NextResponse.json({ ok: true, profile, nextSteps, kycAssessment });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Onboarding failed" }, { status: error.status || 400 });
  }
}
