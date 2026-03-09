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
    const existingProfile = await WorkerProfile.findOne({ userId: user.userId }).lean();
    const kycAssessment = runKycAssessment({
      idProofUrl: data?.docs?.idProof || "",
      selfieUrl: data?.docs?.selfie || "",
    });
    const now = new Date();
    const reviewSlaHours = existingProfile?.verificationFeePaid ? Number(kycAssessment?.recommendedSlaHours || 48) : null;
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          profilePhoto: data.profilePhoto,
          galleryPhotos: data.galleryPhotos,
          bio: data.bio,
          skills: data.skills,
          categories: data.categories,
          serviceAreas: normalizeServiceAreaList(data.serviceAreas || []),
          pricing: normalizedPricing,
          address: data.address,
          docs: data.docs,
          accountStatus: "ONBOARDED",
          verificationStatus: existingProfile?.verificationFeePaid ? "PENDING_REVIEW" : "INCOMPLETE",
          "kyc.queueStatus": existingProfile?.verificationFeePaid ? "pending_review" : "not_submitted",
          "kyc.reviewPriority": kycAssessment.reviewPriority || "normal",
          "kyc.reviewSlaHours": reviewSlaHours,
          "kyc.submittedAt": now,
          "kyc.reviewSlaDueAt":
            existingProfile?.verificationFeePaid && reviewSlaHours
              ? new Date(now.getTime() + reviewSlaHours * 60 * 60 * 1000)
              : null,
          "kyc.rejectionReason": "",
          "kyc.reviewedAt": null,
          "kyc.reviewedBy": null,
          "kyc.assessment": kycAssessment,
        },
        $push: {
          "kyc.history": {
            action: existingProfile?.verificationStatus === "REJECTED" ? "resubmitted" : "submitted",
            reason: `Legacy onboarding endpoint submission | risk:${kycAssessment.riskLevel} auto:${kycAssessment.autoDecision}`,
            actorId: user.userId,
            at: now,
          },
        },
      },
      { upsert: true, new: true }
    );

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
          queueStatus: profile?.kyc?.queueStatus || "not_submitted",
          autoDecision: kycAssessment.autoDecision,
        },
        actorId: user.userId,
        actorRole: user.role,
        req,
      });
    }

    const res = NextResponse.json({ ok: true, profile });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Invalid onboarding payload" }, { status: error.status || 400 });
  }
}
