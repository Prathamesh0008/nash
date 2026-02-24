import Booking from "@/models/Booking";
import WorkerProfile from "@/models/WorkerProfile";
import { isWorkerAvailableForSlot } from "@/lib/availability";

const ACTIVE_SLOT_STATUSES = ["confirmed", "assigned", "onway", "working"];
const ELIGIBLE_SOURCE_STATUSES = ["completed", "cancelled"];
const REBOOK_SOURCE_MAX_AGE_DAYS = Math.max(1, Number(process.env.REBOOK_SOURCE_MAX_AGE_DAYS || 180));
const REBOOK_SOURCE_WARNING_AGE_DAYS = Math.max(1, Number(process.env.REBOOK_SOURCE_WARNING_AGE_DAYS || 90));
const REBOOK_MAX_FUTURE_SLOT_DAYS = Math.max(1, Number(process.env.REBOOK_MAX_FUTURE_SLOT_DAYS || 60));

function toObjectIdText(value) {
  if (!value) return "";
  return String(value);
}

export function isRebookEnabled() {
  const raw = String(process.env.FEATURE_REBOOK || "true").trim().toLowerCase();
  return !["false", "0", "no", "off"].includes(raw);
}

export function getDefaultRebookSlot(originalSlot) {
  const original = new Date(originalSlot);
  const now = Date.now();
  const minFuture = now + 15 * 60 * 1000;

  if (Number.isNaN(original.getTime())) {
    const fallback = new Date(now + 2 * 60 * 60 * 1000);
    fallback.setSeconds(0, 0);
    return fallback;
  }

  const next = new Date(original);
  next.setSeconds(0, 0);
  while (next.getTime() < minFuture) {
    next.setDate(next.getDate() + 7);
  }
  return next;
}

export function parseRebookSlot(requestedSlot, fallbackSlot) {
  const fromFallback = fallbackSlot instanceof Date ? fallbackSlot : new Date(fallbackSlot);
  const hasRequested = String(requestedSlot || "").trim().length > 0;
  const candidate = hasRequested ? new Date(requestedSlot) : new Date(fromFallback);
  if (Number.isNaN(candidate.getTime())) return null;
  candidate.setSeconds(0, 0);
  return candidate;
}

function toIssue(code, message) {
  return { code, message };
}

function hasRequiredAddress(address = {}) {
  const line1 = String(address?.line1 || "").trim();
  const city = String(address?.city || "").trim();
  const pincode = String(address?.pincode || "").trim();
  return Boolean(line1 && city && pincode);
}

export function evaluateRebookEligibility(sourceBooking, { now = new Date() } = {}) {
  const reasons = [];
  const warnings = [];

  if (!sourceBooking) {
    reasons.push(toIssue("SOURCE_NOT_FOUND", "Booking not found for rebook"));
    return { eligible: false, reasons, warnings };
  }

  const sourceStatus = String(sourceBooking.status || "").trim().toLowerCase();
  if (!ELIGIBLE_SOURCE_STATUSES.includes(sourceStatus)) {
    reasons.push(
      toIssue(
        "SOURCE_STATUS_NOT_ALLOWED",
        `Rebook is allowed only for ${ELIGIBLE_SOURCE_STATUSES.join(" / ")} bookings`
      )
    );
  }

  const sourceSlot = new Date(sourceBooking.slotTime);
  if (Number.isNaN(sourceSlot.getTime())) {
    reasons.push(toIssue("SOURCE_SLOT_INVALID", "Source booking slot time is invalid"));
  } else {
    if (sourceSlot.getTime() > now.getTime()) {
      reasons.push(toIssue("SOURCE_SLOT_IN_FUTURE", "Rebook is available only after the original slot time"));
    }

    const ageDays = (now.getTime() - sourceSlot.getTime()) / (24 * 60 * 60 * 1000);
    if (ageDays > REBOOK_SOURCE_MAX_AGE_DAYS) {
      reasons.push(
        toIssue(
          "SOURCE_TOO_OLD",
          `Rebook is allowed within ${REBOOK_SOURCE_MAX_AGE_DAYS} days of original booking`
        )
      );
    } else if (ageDays >= REBOOK_SOURCE_WARNING_AGE_DAYS) {
      warnings.push(
        toIssue(
          "SOURCE_OLD_WARNING",
          `This booking is older than ${REBOOK_SOURCE_WARNING_AGE_DAYS} days. Pricing and worker availability may differ.`
        )
      );
    }
  }

  if (!sourceBooking.serviceId) {
    reasons.push(toIssue("SOURCE_SERVICE_MISSING", "Source booking does not have a valid service"));
  }

  if (!hasRequiredAddress(sourceBooking.address)) {
    reasons.push(toIssue("SOURCE_ADDRESS_INVALID", "Source booking address is incomplete"));
  }

  if (!sourceBooking.workerId) {
    warnings.push(toIssue("SOURCE_NO_PREVIOUS_WORKER", "Previous worker is not available for this order"));
  }

  if (String(sourceBooking.paymentMethod || "").trim().toLowerCase() === "cod") {
    warnings.push(toIssue("SOURCE_PAYMENT_COD", "Rebook may require online or wallet payment"));
  }

  if (sourceBooking.isRebook && Number(sourceBooking.rebookVersion || 0) >= 2) {
    warnings.push(toIssue("CHAINED_REBOOK_WARNING", "This is already a rebooked order"));
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    warnings,
  };
}

export function validateRebookSlotWindow(slotTime, { now = new Date() } = {}) {
  const candidate = slotTime instanceof Date ? slotTime : new Date(slotTime);
  if (Number.isNaN(candidate.getTime())) {
    return { ok: false, maxAllowedAt: null };
  }
  const maxAllowedAt = new Date(now.getTime() + REBOOK_MAX_FUTURE_SLOT_DAYS * 24 * 60 * 60 * 1000);
  if (candidate.getTime() > maxAllowedAt.getTime()) {
    return { ok: false, maxAllowedAt };
  }
  return { ok: true, maxAllowedAt };
}

export function workerServesAddress(workerProfile, address = {}) {
  const areas = Array.isArray(workerProfile?.serviceAreas) ? workerProfile.serviceAreas : [];
  const pincode = String(address?.pincode || "").trim();
  const city = String(address?.city || "").trim().toLowerCase();

  return areas.some((row) => {
    const areaPincode = String(row?.pincode || "").trim();
    const areaCity = String(row?.city || "").trim().toLowerCase();
    return (pincode && areaPincode === pincode) || (city && areaCity === city);
  });
}

export function workerSupportsCategory(workerProfile, category = "") {
  const categories = Array.isArray(workerProfile?.categories) ? workerProfile.categories : [];
  const wanted = String(category || "").trim().toLowerCase();
  if (!wanted) return false;
  return categories.some((row) => String(row || "").trim().toLowerCase() === wanted);
}

async function hasWorkerSlotConflict({ workerId, slotTime, excludeBookingId = null }) {
  const filter = {
    workerId,
    slotTime,
    status: { $in: ACTIVE_SLOT_STATUSES },
  };
  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(filter).select("_id").lean();
  return Boolean(conflict);
}

export async function evaluateSameWorkerForRebook({
  workerId,
  serviceCategory,
  address,
  slotTime,
  excludeBookingId = null,
}) {
  const workerIdText = toObjectIdText(workerId);
  if (!workerIdText) {
    return { available: false, reason: "No previous worker found", workerProfile: null };
  }

  const workerProfile = await WorkerProfile.findOne({
    userId: workerIdText,
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
  }).lean();
  if (!workerProfile) {
    return { available: false, reason: "Previous worker is offline or unavailable", workerProfile: null };
  }

  const serves = workerServesAddress(workerProfile, address);
  if (!serves) {
    return { available: false, reason: "Previous worker does not serve this area", workerProfile };
  }

  const supports = workerSupportsCategory(workerProfile, serviceCategory);
  if (!supports) {
    return { available: false, reason: "Previous worker does not support this service", workerProfile };
  }

  const availableForSlot = isWorkerAvailableForSlot(workerProfile, slotTime);
  if (!availableForSlot) {
    return { available: false, reason: "Previous worker is not available at suggested slot", workerProfile };
  }

  const conflict = await hasWorkerSlotConflict({ workerId: workerIdText, slotTime, excludeBookingId });
  if (conflict) {
    return { available: false, reason: "Previous worker already has another booking at this slot", workerProfile };
  }

  return { available: true, reason: "", workerProfile };
}

export const REBOOK_ACTIVE_SLOT_STATUSES = ACTIVE_SLOT_STATUSES;
export const REBOOK_ELIGIBLE_SOURCE_STATUSES = ELIGIBLE_SOURCE_STATUSES;
