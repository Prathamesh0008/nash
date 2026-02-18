import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { bookingCreateSchema, parseOrThrow } from "@/lib/validators";
import { calculatePriceBreakup } from "@/lib/pricing";
import { matchWorkerForBooking } from "@/lib/matching";
import Service from "@/models/Service";
import Booking from "@/models/Booking";
import Conversation from "@/models/Conversation";
import Payment from "@/models/Payment";
import WorkerProfile from "@/models/WorkerProfile";
import FraudSignal from "@/models/FraudSignal";
import PromoCode from "@/models/PromoCode";
import Referral from "@/models/Referral";
import User from "@/models/User";
import { adjustWallet } from "@/lib/wallet";
import { createNotification } from "@/lib/notify";
import { logError } from "@/lib/monitoring";
import { enforceRateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { sendCrmTemplate } from "@/lib/crm";
import { isWorkerAvailableForSlot } from "@/lib/availability";
import { calculateMembershipDiscount, getActiveMembershipForUser, markMembershipUsage } from "@/lib/membership";
import { normalizeAddressInput } from "@/lib/geo";

const BOOKING_IP_LIMIT = Number(process.env.BOOKING_IP_LIMIT || 20);
const BOOKING_USER_LIMIT = Number(process.env.BOOKING_USER_LIMIT || 5);
const BOOKING_IP_WINDOW_MS = Math.max(1, Number(process.env.BOOKING_IP_WINDOW_MINUTES || 60)) * 60 * 1000;
const BOOKING_USER_WINDOW_MS = Math.max(1, Number(process.env.BOOKING_USER_WINDOW_MINUTES || 15)) * 60 * 1000;
const BOOKING_24X7 =
  String(process.env.BOOKING_24X7 || "").trim().toLowerCase() === "true" ||
  String(process.env.BOOKING_24X7 || "").trim().toLowerCase() === "1" ||
  String(process.env.BOOKING_24X7 || "").trim().toLowerCase() === "yes";
const DEFAULT_REFERRAL_DISCOUNT = Number(process.env.REFERRAL_BOOKING_DISCOUNT || 50);
const DEFAULT_REFERRAL_REWARD = Number(process.env.REFERRAL_REWARD || 100);
const ACTIVE_SLOT_STATUSES = ["confirmed", "assigned", "onway", "working"];

function toSignalSeverity(reasons = []) {
  if (reasons.includes("high_booking_velocity_30m")) return "high";
  if (reasons.includes("booking_velocity_limit_exceeded")) return "critical";
  return reasons.length > 1 ? "medium" : "low";
}

function normalizeCode(input = "") {
  return String(input || "").trim().toUpperCase();
}

function calculatePromoDiscount({ promo, amount }) {
  const gross = Number(amount || 0);
  if (!promo || gross <= 0) return 0;
  if (promo.discountType === "percent") {
    const raw = (gross * Number(promo.discountValue || 0)) / 100;
    const cap = Number(promo.maxDiscount || 0);
    return Math.round(cap > 0 ? Math.min(raw, cap) : raw);
  }
  return Math.round(Math.min(gross, Number(promo.discountValue || 0)));
}

function calculateWorkerPriceBreakup({ workerProfile, selectedExtras = [], taxPercent = 18 }) {
  const base = Math.max(0, Number(workerProfile?.pricing?.basePrice || 0));
  const extrasMap = new Map(
    (workerProfile?.pricing?.extraServices || []).map((row) => [
      String(row?.title || "").trim(),
      Math.max(0, Number(row?.price || 0)),
    ])
  );
  const addons = (selectedExtras || []).reduce((sum, title) => sum + (extrasMap.get(String(title || "").trim()) || 0), 0);
  const visit = 0;
  const subTotal = base + visit + addons;
  const tax = Math.round((subTotal * Number(taxPercent || 0)) / 100);
  const total = subTotal + tax;

  return {
    base,
    visit,
    addons,
    tax,
    total,
    currency: "INR",
  };
}

function workerServesAddress(workerProfile, address = {}) {
  const areas = Array.isArray(workerProfile?.serviceAreas) ? workerProfile.serviceAreas : [];
  const pincode = String(address?.pincode || "").trim();
  const city = String(address?.city || "").trim().toLowerCase();

  return areas.some((row) => {
    const areaPincode = String(row?.pincode || "").trim();
    const areaCity = String(row?.city || "").trim().toLowerCase();
    return (pincode && areaPincode === pincode) || (city && areaCity === city);
  });
}

function workerSupportsCategory(workerProfile, category = "") {
  const categories = Array.isArray(workerProfile?.categories) ? workerProfile.categories : [];
  const wanted = String(category || "").trim().toLowerCase();
  if (!wanted) return false;
  return categories.some((row) => String(row || "").trim().toLowerCase() === wanted);
}

function roundToNextHalfHour(date) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  const mins = next.getMinutes();
  const bump = mins % 30 === 0 ? 30 : 30 - (mins % 30);
  next.setMinutes(mins + bump);
  return next;
}

function toRetryAfterSeconds(retryAfterMs) {
  const value = Math.ceil(Number(retryAfterMs || 0) / 1000);
  return Math.max(1, Number.isFinite(value) ? value : 60);
}

async function findNearestAvailableSlotsForWorker({ workerProfile, fromTime, maxSlots = 5 }) {
  if (!workerProfile?.userId || !fromTime) return [];

  const start = roundToNextHalfHour(new Date(new Date(fromTime).getTime() + 30 * 60 * 1000));
  const horizon = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const candidates = [];
  let cursor = new Date(start);

  while (cursor <= horizon && candidates.length < 120) {
    if (isWorkerAvailableForSlot(workerProfile, cursor, now)) {
      candidates.push(new Date(cursor));
    }
    cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
  }

  if (candidates.length === 0) return [];

  const conflicts = await Booking.find({
    workerId: workerProfile.userId,
    slotTime: { $in: candidates },
    status: { $in: ACTIVE_SLOT_STATUSES },
  })
    .select("slotTime")
    .lean();

  const busyMinutes = new Set(
    conflicts.map((row) => Math.floor(new Date(row.slotTime).getTime() / 60000))
  );

  return candidates
    .filter((slot) => !busyMinutes.has(Math.floor(slot.getTime() / 60000)))
    .slice(0, maxSlots)
    .map((slot) => slot.toISOString());
}

export async function POST(req) {
  const ipRl = enforceRateLimit({
    key: getRateLimitKey(req, "booking:create:ip"),
    limit: BOOKING_IP_LIMIT,
    windowMs: BOOKING_IP_WINDOW_MS,
  });
  if (!ipRl.ok) {
    const retryAfterSeconds = toRetryAfterSeconds(ipRl.retryAfterMs);
    const res = NextResponse.json(
      {
        ok: false,
        error: `Too many booking requests from this network. Try again in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds,
      },
      { status: 429 }
    );
    res.headers.set("Retry-After", String(retryAfterSeconds));
    return res;
  }

  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "admin"] });
  if (errorResponse) return errorResponse;

  const userRl = enforceRateLimit({
    key: `booking:create:user:${user.userId}`,
    limit: BOOKING_USER_LIMIT,
    windowMs: BOOKING_USER_WINDOW_MS,
  });
  if (!userRl.ok) {
    const retryAfterSeconds = toRetryAfterSeconds(userRl.retryAfterMs);
    await FraudSignal.create({
      userId: user.userId,
      signalType: "booking_risk",
      severity: "critical",
      reasons: ["booking_velocity_limit_exceeded"],
      status: "open",
      meta: { scope: "booking:create", retryAfterMs: userRl.retryAfterMs || 0 },
    });
    const res = NextResponse.json(
      {
        ok: false,
        error: `Too many booking attempts. Try again in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds,
      },
      { status: 429 }
    );
    res.headers.set("Retry-After", String(retryAfterSeconds));
    return res;
  }

  try {
    const data = parseOrThrow(bookingCreateSchema, await req.json());
    const idempotencyKey = (req.headers.get("x-idempotency-key") || data.idempotencyKey || "").trim().slice(0, 128);
    const requestedServiceId = String(data.serviceId || "").trim();
    const isManualAssignment = data.assignmentMode === "manual";
    const workerPricingMode = isManualAssignment && !requestedServiceId;

    if (requestedServiceId && !mongoose.Types.ObjectId.isValid(requestedServiceId)) {
      return NextResponse.json({ ok: false, error: "Invalid serviceId" }, { status: 400 });
    }
    if (!requestedServiceId && !isManualAssignment) {
      return NextResponse.json({ ok: false, error: "serviceId is required for auto assignment" }, { status: 400 });
    }
    if (isManualAssignment && (!data.manualWorkerId || !mongoose.Types.ObjectId.isValid(data.manualWorkerId))) {
      return NextResponse.json({ ok: false, error: "Valid manualWorkerId is required for manual assignment" }, { status: 400 });
    }

    if (idempotencyKey) {
      const existingByKey = await Booking.findOne({
        userId: user.userId,
        idempotencyKey,
      }).lean();
      if (existingByKey) {
        const res = NextResponse.json({ ok: true, booking: existingByKey, idempotent: true });
        return applyRefreshCookies(res, refreshedResponse);
      }
    }

    let manualWorkerProfile = null;
    if (isManualAssignment) {
      manualWorkerProfile = await WorkerProfile.findOne({
        userId: data.manualWorkerId,
        verificationStatus: "APPROVED",
        verificationFeePaid: true,
        isOnline: true,
      }).lean();
    }

    let service = null;
    if (requestedServiceId) {
      service = await Service.findById(requestedServiceId).lean();
      if (!service || !service.active) {
        return NextResponse.json({ ok: false, error: "Service not available" }, { status: 404 });
      }
    } else if (isManualAssignment) {
      const workerCategorySet = new Set(
        (manualWorkerProfile?.categories || [])
          .map((row) => String(row || "").trim().toLowerCase())
          .filter(Boolean)
      );

      if (workerCategorySet.size > 0) {
        const categoryServices = await Service.find({ active: true })
          .sort({ basePrice: 1, createdAt: 1 })
          .lean();
        service =
          categoryServices.find((row) =>
            workerCategorySet.has(String(row?.category || "").trim().toLowerCase())
          ) || null;
      }

      // Keep flow stable and let explicit availability checks below return clear reasons.
      if (!service && !manualWorkerProfile) {
        service = await Service.findOne({ active: true }).sort({ createdAt: 1 }).lean();
      }

      // In worker-pricing mode, category mapping may be missing in Service master.
      // Use a generic active service record as booking anchor so checkout can continue.
      if (!service && workerPricingMode) {
        service = await Service.findOne({ active: true }).sort({ createdAt: 1 }).lean();
      }
      if (!service) {
        return NextResponse.json({ ok: false, error: "No active services configured for booking" }, { status: 404 });
      }
    }

    const slotTime = new Date(data.slotTime);
    if (Number.isNaN(slotTime.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid slot time" }, { status: 400 });
    }
    if (slotTime.getTime() < Date.now() - 60 * 1000) {
      return NextResponse.json({ ok: false, error: "Please select a future slot time" }, { status: 400 });
    }
    if (!BOOKING_24X7 && slotTime.getTime() < Date.now() + 15 * 60 * 1000) {
      return NextResponse.json({ ok: false, error: "Please select a slot at least 15 minutes from now" }, { status: 400 });
    }

    const userSlotConflict = await Booking.findOne({
      userId: user.userId,
      slotTime,
      status: { $in: ACTIVE_SLOT_STATUSES },
    }).lean();
    if (userSlotConflict) {
      return NextResponse.json(
        {
          ok: false,
          error: "You already have an active booking at this slot. Please choose another time.",
          bookingId: userSlotConflict._id,
        },
        { status: 409 }
      );
    }

    const duplicateBooking = await Booking.findOne({
      userId: user.userId,
      serviceId: service._id,
      slotTime,
      status: { $in: ACTIVE_SLOT_STATUSES },
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    }).lean();
    if (duplicateBooking) {
      return NextResponse.json(
        { ok: false, error: "Duplicate booking request detected. Please check your orders.", bookingId: duplicateBooking._id },
        { status: 409 }
      );
    }

    if (workerPricingMode && !manualWorkerProfile) {
      return NextResponse.json(
        { ok: false, error: "Selected worker is not available for direct pricing booking" },
        { status: 409 }
      );
    }

    const priceBreakup = workerPricingMode
      ? calculateWorkerPriceBreakup({
          workerProfile: manualWorkerProfile,
          selectedExtras: data.addons,
          taxPercent: Number(service?.taxPercent || 18),
        })
      : calculatePriceBreakup({ service, selectedAddons: data.addons });
    const normalizedAddress = normalizeAddressInput(data.address || {});
    const promoCode = normalizeCode(data.promoCode);
    const referralCodeInput = normalizeCode(data.referralCode);
    let promo = null;
    let promoDiscount = 0;
    let referralCode = "";
    let referralDiscount = 0;
    let referrerUser = null;
    let activeMembership = null;
    let membershipPlanCode = "";
    let membershipDiscount = 0;

    if (promoCode) {
      promo = await PromoCode.findOne({
        code: promoCode,
        active: true,
        $and: [
          { $or: [{ validFrom: null }, { validFrom: { $lte: new Date() } }] },
          { $or: [{ validTill: null }, { validTill: { $gte: new Date() } }] },
        ],
      })
        .setOptions({ sanitizeFilter: true })
        .lean();

      if (!promo) {
        return NextResponse.json({ ok: false, error: "Invalid or expired promo code" }, { status: 400 });
      }
      if (Number(promo.minOrderAmount || 0) > Number(priceBreakup.total || 0)) {
        return NextResponse.json({ ok: false, error: `Promo requires minimum order of INR ${promo.minOrderAmount}` }, { status: 400 });
      }
      if (Number(promo.maxUses || 0) > 0 && Number(promo.usedCount || 0) >= Number(promo.maxUses || 0)) {
        return NextResponse.json({ ok: false, error: "Promo usage limit reached" }, { status: 400 });
      }
      if (Array.isArray(promo.allowedCategories) && promo.allowedCategories.length > 0 && !promo.allowedCategories.includes(service.category)) {
        return NextResponse.json({ ok: false, error: "Promo not valid for selected service category" }, { status: 400 });
      }
      if (
        Array.isArray(promo.allowedServiceIds) &&
        promo.allowedServiceIds.length > 0 &&
        !promo.allowedServiceIds.some((id) => id?.toString() === service._id.toString())
      ) {
        return NextResponse.json({ ok: false, error: "Promo not valid for selected service" }, { status: 400 });
      }

      if (Number(promo.perUserLimit || 0) > 0) {
        const usageCount = await Booking.countDocuments({ userId: user.userId, promoCode });
        if (usageCount >= Number(promo.perUserLimit || 0)) {
          return NextResponse.json({ ok: false, error: "You have already used this promo code" }, { status: 400 });
        }
      }

      promoDiscount = calculatePromoDiscount({ promo, amount: priceBreakup.total });
    }

    const requester = await User.findById(user.userId).select("_id name role referredBy referralCode").lean();
    if (referralCodeInput || requester?.referredBy) {
      const referralAlreadyUsed = await Booking.exists({
        userId: user.userId,
        referralDiscount: { $gt: 0 },
      });

      if (!referralAlreadyUsed) {
        if (referralCodeInput) {
          referrerUser = await User.findOne({ referralCode: referralCodeInput }).select("_id name role referralCode").lean();
          if (!referrerUser) {
            return NextResponse.json({ ok: false, error: "Invalid referral code" }, { status: 400 });
          }
        } else if (requester?.referredBy) {
          referrerUser = await User.findById(requester.referredBy).select("_id name role referralCode").lean();
        }

        if (referrerUser && String(referrerUser._id) === user.userId) {
          return NextResponse.json({ ok: false, error: "You cannot use your own referral code" }, { status: 400 });
        }

        if (referrerUser && String(referrerUser._id) !== user.userId) {
          referralCode = String(referrerUser.referralCode || referralCodeInput || "");
          referralDiscount = Math.min(
            Math.max(0, Number(DEFAULT_REFERRAL_DISCOUNT || 0)),
            Math.max(0, Number(priceBreakup.total || 0) - Number(promoDiscount || 0))
          );
          if (referralCodeInput && !requester?.referredBy) {
            await User.updateOne({ _id: user.userId }, { $set: { referredBy: referrerUser._id } });
          }
          await Referral.findOneAndUpdate(
            { referrerId: referrerUser._id, refereeId: user.userId },
            {
              $set: {
                referralCode,
                status: "discount_applied",
                referralDiscount,
                note: "Referral discount applied on first booking",
              },
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    activeMembership = await getActiveMembershipForUser({ userId: user.userId });
    if (activeMembership) {
      const membershipCalc = calculateMembershipDiscount({
        membership: activeMembership,
        amount: Number(priceBreakup.total || 0),
      });
      membershipDiscount = Number(membershipCalc.discount || 0);
      membershipPlanCode = membershipCalc.planCode || "";
    }

    // Membership and promo are mutually exclusive to avoid stacking abuse.
    if (promoDiscount > 0 && membershipDiscount > 0) {
      if (promoDiscount >= membershipDiscount) {
        membershipDiscount = 0;
        membershipPlanCode = "";
      } else {
        promoDiscount = 0;
        promo = null;
      }
    }

    const maxReferralAllowed = Math.max(
      0,
      Number(priceBreakup.total || 0) - Number(promoDiscount || 0) - Number(membershipDiscount || 0)
    );
    referralDiscount = Math.min(Number(referralDiscount || 0), maxReferralAllowed);

    if (referrerUser?._id) {
      await Referral.updateOne(
        { referrerId: referrerUser._id, refereeId: user.userId },
        { $set: { referralDiscount } }
      );
    }

    const finalDiscount = Number(promoDiscount || 0) + Number(referralDiscount || 0) + Number(membershipDiscount || 0);
    const finalTotal = Math.max(0, Number(priceBreakup.total || 0) - finalDiscount);
    const finalPriceBreakup = {
      ...priceBreakup,
      discount: finalDiscount,
      total: finalTotal,
    };
    const recentWindow = new Date(Date.now() - 30 * 60 * 1000);
    const recentBookings = await Booking.find({ userId: user.userId, createdAt: { $gte: recentWindow } })
      .select("_id serviceId slotTime priceBreakup.total")
      .lean();
    const suspiciousReasons = [];
    if (recentBookings.length >= 5) {
      suspiciousReasons.push("high_booking_velocity_30m");
    }
    if (recentBookings.some((b) => Math.abs(new Date(b.slotTime).getTime() - slotTime.getTime()) <= 5 * 60 * 1000)) {
      suspiciousReasons.push("repeated_same_slot_pattern");
    }
    if (Number(priceBreakup.total || 0) >= 50000) {
      suspiciousReasons.push("high_value_booking");
    }

    if (suspiciousReasons.length > 0) {
      await FraudSignal.create({
        userId: user.userId,
        signalType: "booking_risk",
        severity: toSignalSeverity(suspiciousReasons),
        reasons: suspiciousReasons,
        status: "open",
        meta: {
          serviceId: service._id?.toString(),
          slotTime,
          amount: finalPriceBreakup.total,
          assignmentMode: data.assignmentMode,
        },
      });

      if (recentBookings.length >= 8) {
        return NextResponse.json(
          { ok: false, error: "Booking temporarily held for safety checks. Please contact support." },
          { status: 429 }
        );
      }
    }

    let workerId = null;
    let assignmentReason = "No worker matched at booking time";
    const strictWorker = data.assignmentMode === "manual" ? data.strictWorker !== false : false;

    if (data.assignmentMode === "manual") {
      const manualWorker = manualWorkerProfile;

      if (!manualWorker) {
        if (strictWorker) {
          return NextResponse.json(
            {
              ok: false,
              error: "Selected worker is not available.",
              code: "STRICT_WORKER_UNAVAILABLE",
              strictWorker: true,
              manualWorkerId: data.manualWorkerId,
              nearestSlots: [],
              options: {
                useNearestSlot: false,
                requestCallback: true,
                allowAlternateWorker: true,
                cancel: true,
              },
            },
            { status: 409 }
          );
        }

        const matched = await matchWorkerForBooking({
          category: service.category,
          areaPincode: data.address.pincode,
          areaCity: data.address.city,
          slotTime,
          excludeWorkerIds: [data.manualWorkerId],
        });
        if (matched?.worker?.userId) {
          workerId = matched.worker.userId;
          assignmentReason = `Selected worker unavailable. Auto switched to alternate worker (score ${matched.score.toFixed(2)})`;
        } else {
          return NextResponse.json(
            {
              ok: false,
              error: "Selected worker is not available and no alternate worker found for this slot.",
              code: "MANUAL_WORKER_UNAVAILABLE",
              strictWorker: false,
              manualWorkerId: data.manualWorkerId,
              nearestSlots: [],
              options: {
                useNearestSlot: false,
                requestCallback: true,
                cancel: true,
              },
            },
            { status: 409 }
          );
        }
      }
      if (manualWorker && !workerId) {
        const supportsCategory = workerPricingMode
          ? true
          : workerSupportsCategory(manualWorker, service.category);
        const servesArea = workerServesAddress(manualWorker, data.address);
        const isAvailable = servesArea && supportsCategory && isWorkerAvailableForSlot(manualWorker, slotTime);

        let hasConflict = false;
        if (servesArea && supportsCategory && isAvailable) {
          const manualWorkerConflict = await Booking.findOne({
            workerId: data.manualWorkerId,
            slotTime,
            status: { $in: ACTIVE_SLOT_STATUSES },
          }).lean();
          hasConflict = Boolean(manualWorkerConflict);
        }

        if (servesArea && supportsCategory && isAvailable && !hasConflict) {
          workerId = manualWorker.userId;
          assignmentReason = "Manually selected by customer";
        } else if (strictWorker) {
          const nearestSlots =
            servesArea && supportsCategory
              ? await findNearestAvailableSlotsForWorker({ workerProfile: manualWorker, fromTime: slotTime, maxSlots: 5 })
              : [];

          let reason = "Selected worker is unavailable for this slot.";
          if (!servesArea) reason = "Selected worker does not serve this area.";
          else if (!supportsCategory) reason = "Selected worker does not support this service category.";
          else if (!isAvailable) reason = "Selected worker is unavailable as per schedule for this slot.";
          else if (hasConflict) reason = "Selected worker already has a booking at this slot.";

          return NextResponse.json(
            {
              ok: false,
              error: reason,
              code: "STRICT_WORKER_UNAVAILABLE",
              strictWorker: true,
              manualWorkerId: data.manualWorkerId,
              nearestSlots,
              checks: {
                servesArea,
                supportsCategory,
                isAvailable,
                hasConflict,
              },
              options: {
                useNearestSlot: nearestSlots.length > 0,
                requestCallback: true,
                allowAlternateWorker: true,
                cancel: true,
              },
            },
            { status: 409 }
          );
        } else {
          const matched = await matchWorkerForBooking({
            category: service.category,
            areaPincode: data.address.pincode,
            areaCity: data.address.city,
            slotTime,
            excludeWorkerIds: [data.manualWorkerId],
          });
          if (matched?.worker?.userId) {
            workerId = matched.worker.userId;
            assignmentReason = `Selected worker unavailable. Auto switched to alternate worker (score ${matched.score.toFixed(2)})`;
          } else {
            const nearestSlots =
              servesArea && supportsCategory
                ? await findNearestAvailableSlotsForWorker({ workerProfile: manualWorker, fromTime: slotTime, maxSlots: 5 })
                : [];

            let reason = "Selected worker is unavailable and no alternate worker found for this slot.";
            if (!servesArea) reason = "Selected worker does not serve this area.";
            else if (!supportsCategory) reason = "Selected worker does not support this service category.";

            return NextResponse.json(
              {
                ok: false,
                error: reason,
                code: "MANUAL_WORKER_UNAVAILABLE",
                strictWorker: false,
                manualWorkerId: data.manualWorkerId,
                nearestSlots,
                options: {
                  useNearestSlot: nearestSlots.length > 0,
                  requestCallback: true,
                  cancel: true,
                },
              },
              { status: 409 }
            );
          }
        }
      }
    } else if (data.assignmentMode === "auto") {
      const matched = await matchWorkerForBooking({
        category: service.category,
        areaPincode: data.address.pincode,
        areaCity: data.address.city,
        slotTime,
      });
      if (matched?.worker?.userId) {
        const autoWorkerConflict = await Booking.findOne({
          workerId: matched.worker.userId,
          slotTime,
          status: { $in: ACTIVE_SLOT_STATUSES },
        }).lean();
        if (!autoWorkerConflict) {
          workerId = matched.worker.userId;
          assignmentReason = `Auto matched with score ${matched.score.toFixed(2)}`;
        } else {
          assignmentReason = "Auto matched worker is busy at selected slot. Booking created without assignment.";
        }
      }
    }

    let paymentId = null;
    let paymentStatus = "unpaid";

    if (data.paymentMethod === "wallet") {
      await adjustWallet({
        userId: user.userId,
        ownerType: user.role,
        direction: "debit",
        reason: "booking_payment",
        amount: finalPriceBreakup.total,
        referenceType: "booking",
      });
      paymentStatus = "paid";
    } else if (data.paymentMethod === "online") {
      const payment = await Payment.create({
        userId: user.userId,
        workerId,
        type: "booking",
        amount: finalPriceBreakup.total,
        status: "paid",
        provider: "demo",
        providerPaymentId: `demo_${Date.now()}`,
        metadata: {
          promoCode,
          referralCode,
          discount: finalDiscount,
        },
      });
      paymentId = payment._id;
      paymentStatus = "paid";
    }

    const booking = await Booking.create({
      userId: user.userId,
      workerId,
      serviceId: service._id,
      address: normalizedAddress,
      slotTime,
      notes: data.notes || "",
      images: data.images || [],
      selectedAddons: data.addons || [],
      status: workerId ? "assigned" : "confirmed",
      statusLogs: [
        {
          status: "confirmed",
          actorRole: user.role,
          actorId: user.userId,
          note: "Booking confirmed",
        },
        ...(workerId
          ? [
              {
                status: "assigned",
                actorRole: "system",
                note: "Worker assigned",
              },
            ]
          : []),
      ],
      assignmentMode: data.assignmentMode,
      assignmentReason,
      strictWorker,
      requestedWorkerId: data.assignmentMode === "manual" ? data.manualWorkerId : null,
      priceBreakup: finalPriceBreakup,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      paymentId,
      idempotencyKey,
      promoCode,
      promoDiscount,
      referralCode,
      referralDiscount,
      membershipPlanCode,
      membershipDiscount,
      userMembershipId: membershipDiscount > 0 ? activeMembership?._id || null : null,
    });

    if (promo?._id) {
      await PromoCode.updateOne({ _id: promo._id }, { $inc: { usedCount: 1 } });
    }

    if (membershipDiscount > 0 && activeMembership?._id) {
      await markMembershipUsage({
        membershipId: activeMembership._id,
        bookingId: booking._id,
        discount: membershipDiscount,
      });
    }

    if (workerId) {
      const conversation = await Conversation.findOneAndUpdate(
        {
          bookingId: booking._id,
          userId: booking.userId,
          workerUserId: workerId,
        },
        {
          $setOnInsert: {
            bookingId: booking._id,
            userId: booking.userId,
            workerUserId: workerId,
          },
          $set: { lastMessageAt: new Date() },
        },
        { upsert: true, new: true }
      );

      booking.conversationId = conversation._id;
      await booking.save();
    }

    await createNotification({
      userId: booking.userId,
      actorId: user.userId,
      type: "status",
      title: workerId ? "Booking confirmed and worker assigned" : "Booking confirmed",
      body: `Service booking scheduled for ${new Date(booking.slotTime).toLocaleString()}`,
      href: `/orders/${booking._id}`,
      meta: { bookingId: booking._id.toString(), status: booking.status },
    });

    if (workerId) {
      await createNotification({
        userId: workerId,
        actorId: user.userId,
        type: "status",
        title: "New job assigned",
        body: `You have a new ${service.title} job.`,
        href: `/worker/jobs/${booking._id}`,
        meta: { bookingId: booking._id.toString(), status: "assigned" },
      });
    }

    if (referrerUser?._id && paymentStatus === "paid" && Number(DEFAULT_REFERRAL_REWARD || 0) > 0) {
      await adjustWallet({
        userId: referrerUser._id,
        ownerType: referrerUser.role || "user",
        direction: "credit",
        reason: "referral_reward",
        amount: Number(DEFAULT_REFERRAL_REWARD || 0),
        referenceType: "booking",
        referenceId: booking._id,
        note: `Referral reward for booking ${booking._id.toString().slice(-6)}`,
      });
      await Referral.updateOne(
        { referrerId: referrerUser._id, refereeId: user.userId },
        {
          $set: {
            bookingId: booking._id,
            status: "reward_credited",
            rewardAmount: Number(DEFAULT_REFERRAL_REWARD || 0),
          },
        }
      );
      await User.updateOne(
        { _id: referrerUser._id },
        { $inc: { "referralStats.totalRewards": Number(DEFAULT_REFERRAL_REWARD || 0) } }
      );
      await createNotification({
        userId: referrerUser._id,
        actorId: user.userId,
        type: "status",
        title: "Referral reward credited",
        body: `INR ${Number(DEFAULT_REFERRAL_REWARD || 0)} added to your wallet.`,
        href: "/wallet",
        meta: { bookingId: booking._id.toString(), reward: Number(DEFAULT_REFERRAL_REWARD || 0) },
      });
    }

    const crmVars = {
      bookingId: booking._id.toString().slice(-6),
      service: service.title,
      slotTime: new Date(booking.slotTime).toLocaleString(),
    };
    await Promise.all([
      sendCrmTemplate({
        templateKey: "booking_created_user",
        channel: "email",
        userId: booking.userId,
        variables: crmVars,
        meta: { bookingId: booking._id.toString() },
      }),
      sendCrmTemplate({
        templateKey: "booking_created_user",
        channel: "sms",
        userId: booking.userId,
        variables: crmVars,
        meta: { bookingId: booking._id.toString() },
      }),
      workerId
        ? sendCrmTemplate({
            templateKey: "booking_created_worker",
            channel: "whatsapp",
            userId: workerId,
            variables: crmVars,
            meta: { bookingId: booking._id.toString() },
          })
        : Promise.resolve({ ok: true }),
    ]);

    const res = NextResponse.json({
      ok: true,
      booking,
      discount: {
        promoCode,
        promoDiscount,
        referralCode,
        referralDiscount,
        membershipPlanCode,
        membershipDiscount,
        totalDiscount: finalDiscount,
      },
    });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    await logError("api.bookings.create", error, { userId: user?.userId || "" });
    if (error?.code === 11000) {
      const retryBooking = await Booking.findOne({ userId: user.userId }).sort({ createdAt: -1 }).lean();
      if (retryBooking) {
        const res = NextResponse.json({ ok: true, booking: retryBooking, idempotent: true });
        return applyRefreshCookies(res, refreshedResponse);
      }
    }
    return NextResponse.json({ ok: false, error: error.message || "Booking failed" }, { status: error.status || 400 });
  }
}
