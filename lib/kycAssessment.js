import crypto from "crypto";

function hashToInt(seed) {
  const hex = crypto.createHash("sha256").update(String(seed || "")).digest("hex").slice(0, 12);
  return Number.parseInt(hex, 16);
}

function scoreFromSeed(seed, min = 0, max = 100) {
  const base = hashToInt(seed);
  const span = Math.max(1, max - min + 1);
  return min + (base % span);
}

function inferDobFromUrl(url = "") {
  const match = String(url || "").match(/(19\d{2}|20\d{2})[-_/](0[1-9]|1[0-2])[-_/](0[1-9]|[12]\d|3[01])/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function computeAgeYears(dob) {
  if (!(dob instanceof Date) || Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age;
}

function inferAgeYears(idProofUrl = "", selfieUrl = "") {
  const dob = inferDobFromUrl(idProofUrl);
  if (dob) return { dob, ageYears: computeAgeYears(dob), source: "dob_in_url" };
  const seededAge = scoreFromSeed(`${idProofUrl}:${selfieUrl}:age`, 19, 45);
  const pseudoDob = new Date(Date.UTC(new Date().getUTCFullYear() - seededAge, 5, 15));
  return { dob: pseudoDob, ageYears: seededAge, source: "heuristic" };
}

export function getKycSlaHoursByRisk(riskLevel = "low") {
  if (riskLevel === "critical") return 4;
  if (riskLevel === "high") return 12;
  if (riskLevel === "medium") return 24;
  return 48;
}

export function runKycAssessment({ idProofUrl = "", selfieUrl = "" } = {}) {
  const now = new Date();
  const docOcrScore = scoreFromSeed(`ocr:${idProofUrl}`, 58, 98);
  const faceMatchScore = scoreFromSeed(`face:${idProofUrl}:${selfieUrl}`, 38, 99);
  const ageInfo = inferAgeYears(idProofUrl, selfieUrl);
  const flags = [];

  if (ageInfo.ageYears !== null && ageInfo.ageYears < 21) flags.push("possible_underage");
  if (docOcrScore < 70) flags.push("low_document_ocr_confidence");
  if (faceMatchScore < 65) flags.push("weak_face_match");

  const hasCriticalFlag = flags.includes("possible_underage");
  const hasHighFlag = flags.includes("weak_face_match");
  const riskLevel = hasCriticalFlag ? "critical" : hasHighFlag ? "high" : flags.length > 0 ? "medium" : "low";
  const autoDecision = hasCriticalFlag || faceMatchScore < 45 || docOcrScore < 50 ? "reject" : flags.length > 0 ? "review" : "pass";
  const reviewPriority = riskLevel === "critical" ? "critical" : riskLevel === "high" ? "high" : "normal";
  const recommendedSlaHours = getKycSlaHoursByRisk(riskLevel);

  return {
    assessedAt: now,
    provider: {
      ocr: "simulated_ocr_v1",
      faceMatch: "simulated_face_match_v1",
    },
    docOcr: {
      score: docOcrScore,
      status: docOcrScore >= 80 ? "pass" : docOcrScore >= 60 ? "review" : "fail",
      extracted: {
        ageYears: ageInfo.ageYears,
        dob: ageInfo.dob?.toISOString()?.slice(0, 10) || "",
        source: ageInfo.source,
      },
      checkedAt: now,
    },
    faceMatch: {
      score: faceMatchScore,
      threshold: 65,
      status: faceMatchScore >= 75 ? "pass" : faceMatchScore >= 60 ? "review" : "fail",
      checkedAt: now,
    },
    flags,
    riskLevel,
    autoDecision,
    reviewPriority,
    recommendedSlaHours,
  };
}
