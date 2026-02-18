import MembershipPlan from "@/models/MembershipPlan";
import UserMembership from "@/models/UserMembership";

const DEFAULT_MEMBERSHIP_PLANS = [
  {
    code: "SILVER",
    name: "Silver Pass",
    description: "Save 5% on each booking with monthly cap benefits.",
    price: 149,
    durationDays: 30,
    discountType: "percent",
    discountValue: 5,
    maxDiscountPerBooking: 120,
    maxTotalDiscount: 600,
    perks: ["5% off on bookings", "Priority support queue"],
    sortOrder: 10,
    active: true,
  },
  {
    code: "GOLD",
    name: "Gold Pass",
    description: "Higher discount and larger monthly savings cap.",
    price: 299,
    durationDays: 30,
    discountType: "percent",
    discountValue: 10,
    maxDiscountPerBooking: 200,
    maxTotalDiscount: 1200,
    perks: ["10% off on bookings", "Priority support queue", "Fast issue handling"],
    sortOrder: 20,
    active: true,
  },
  {
    code: "FAMILY",
    name: "Family Pass",
    description: "Quarterly plan with bigger flexibility and savings.",
    price: 499,
    durationDays: 90,
    discountType: "percent",
    discountValue: 10,
    maxDiscountPerBooking: 250,
    maxTotalDiscount: 2400,
    perks: ["10% off on bookings", "Priority support queue", "Longer validity"],
    sortOrder: 30,
    active: true,
  },
];

function normalizePlanText(value = "") {
  return String(value || "").trim().toUpperCase();
}

export function isFamilyPassPlan({ code = "", name = "" } = {}) {
  const normalizedCode = normalizePlanText(code).replace(/[\s-]+/g, "_");
  const normalizedName = normalizePlanText(name).replace(/\s+/g, " ");

  if (normalizedCode === "FAMILY" || normalizedCode === "FAMILY_PASS" || normalizedCode === "FAMILYPASS") {
    return true;
  }
  if (normalizedCode.startsWith("FAMILY")) return true;
  if (normalizedName.includes("FAMILY PASS") || normalizedName === "FAMILY") return true;
  return /\bFAMILY\b/.test(normalizedName) && /\bPASS\b/.test(normalizedName);
}

export function isFamilyPassMembership(membership = null) {
  if (!membership) return false;
  const code = membership?.planSnapshot?.code || membership?.code || "";
  const name = membership?.planSnapshot?.name || membership?.name || "";
  return isFamilyPassPlan({ code, name });
}

export async function ensureDefaultMembershipPlans() {
  await Promise.all(
    DEFAULT_MEMBERSHIP_PLANS.map((plan) =>
      MembershipPlan.updateOne(
        { code: plan.code },
        { $setOnInsert: plan },
        { upsert: true }
      )
    )
  );
}

export async function expireUserMemberships({ userId = null, now = new Date() } = {}) {
  const filter = {
    status: "active",
    endsAt: { $lte: now },
  };
  if (userId) filter.userId = userId;
  await UserMembership.updateMany(filter, { $set: { status: "expired" } });
}

export async function getActiveMembershipForUser({ userId, now = new Date() }) {
  if (!userId) return null;
  await expireUserMemberships({ userId, now });
  return UserMembership.findOne({
    userId,
    status: "active",
    startedAt: { $lte: now },
    endsAt: { $gt: now },
  })
    .sort({ endsAt: -1 })
    .lean();
}

export function calculateMembershipDiscount({ membership, amount }) {
  const gross = Number(amount || 0);
  if (!membership || gross <= 0) {
    return { discount: 0, remainingTotalDiscount: 0, planCode: "" };
  }

  const plan = membership.planSnapshot || {};
  const discountType = String(plan.discountType || "percent");
  const discountValue = Number(plan.discountValue || 0);
  let discount = 0;

  if (discountType === "flat") {
    discount = discountValue;
  } else {
    discount = (gross * discountValue) / 100;
  }

  const maxPerBooking = Number(plan.maxDiscountPerBooking || 0);
  if (maxPerBooking > 0) {
    discount = Math.min(discount, maxPerBooking);
  }

  const maxTotal = Number(plan.maxTotalDiscount || 0);
  const used = Number(membership.discountUsed || 0);
  const remaining = maxTotal > 0 ? Math.max(0, maxTotal - used) : Number.MAX_SAFE_INTEGER;
  discount = Math.min(discount, remaining, gross);

  return {
    discount: Math.max(0, Math.round(discount)),
    remainingTotalDiscount: remaining === Number.MAX_SAFE_INTEGER ? null : Math.round(remaining),
    planCode: String(plan.code || ""),
  };
}

export async function markMembershipUsage({ membershipId, bookingId = null, discount = 0 }) {
  const safeDiscount = Math.max(0, Math.round(Number(discount || 0)));
  if (!membershipId || safeDiscount <= 0) return;

  const patch = {
    $inc: {
      discountUsed: safeDiscount,
      usageCount: 1,
    },
  };
  if (bookingId) {
    patch.$addToSet = { bookingIds: bookingId };
  }

  await UserMembership.updateOne(
    { _id: membershipId, status: "active" },
    patch
  );
}
