import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import ActiveBoost from "@/models/ActiveBoost";
import BoostPlan from "@/models/BoostPlan";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Service from "@/models/Service";
import { getAuthUser, applyRefreshCookies } from "@/lib/apiAuth";
import { maskPhone, maskEmail } from "@/lib/privacy";
import { computeWorkerQuality } from "@/lib/workerQuality";

export async function GET(req, context) {
  await dbConnect();
  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  const worker = await WorkerProfile.findOne({ userId: id }).lean();
  if (!worker) return NextResponse.json({ ok: false, error: "Worker not found" }, { status: 404 });

  const [viewerAuth, user] = await Promise.all([
    getAuthUser({ allowRefresh: true }),
    User.findById(id).select("name email phone role").lean(),
  ]);
  const viewer = viewerAuth?.user || null;

  const canBypassOffline =
    viewer?.role === "admin" || String(viewer?.userId || "") === String(id);
  if (!worker.isOnline && !canBypassOffline) {
    return NextResponse.json({ ok: false, error: "Worker not found" }, { status: 404 });
  }

  let contactUnlocked = false;
  let canReview = false;
  if (viewer?.role === "admin" || viewer?.userId === String(id)) {
    contactUnlocked = true;
  } else if (viewer?.userId) {
    const validBooking = await Booking.findOne({
      status: { $in: ["assigned", "onway", "working", "completed"] },
      $or: [
        { userId: viewer.userId, workerId: id },
        { workerId: viewer.userId, userId: id },
      ],
    }).select("_id status").lean();
    contactUnlocked = Boolean(validBooking);
    if (viewer.role === "user") {
      const completed = await Booking.findOne({
        userId: viewer.userId,
        workerId: id,
        status: "completed",
      }).select("_id").lean();
      canReview = Boolean(completed);
    }
  }

  const safeUser = user
    ? {
        ...user,
        phone: contactUnlocked ? user.phone : maskPhone(user.phone),
        email: contactUnlocked ? user.email : maskEmail(user.email),
      }
    : null;

  const activeBoost = await ActiveBoost.findOne({
    workerId: id,
    status: "active",
    startAt: { $lte: new Date() },
    endAt: { $gte: new Date() },
  })
    .sort({ boostScore: -1 })
    .lean();

  let boostPlan = null;
  if (activeBoost?.planId) {
    boostPlan = await BoostPlan.findById(activeBoost.planId)
      .select("name durationDays boostScore")
      .lean();
  }

  const [reviews, reviewAgg, pricingAgg, serviceOptions] = await Promise.all([
    Review.find({ workerUserId: id })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    Review.aggregate([
      { $match: { workerUserId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$workerUserId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { workerId: new mongoose.Types.ObjectId(id), status: { $in: ["assigned", "onway", "working", "completed"] } } },
      {
        $group: {
          _id: "$workerId",
          min: { $min: "$priceBreakup.total" },
          max: { $max: "$priceBreakup.total" },
          avg: { $avg: "$priceBreakup.total" },
          count: { $sum: 1 },
        },
      },
    ]),
    Service.find({
      active: true,
      category: { $in: worker.categories || [] },
    })
      .select("title slug category basePrice visitFee taxPercent")
      .limit(20)
      .lean(),
  ]);

  const reviewerIds = [...new Set(reviews.map((r) => r.userId?.toString()).filter(Boolean))];
  const reviewers = reviewerIds.length
    ? await User.find({ _id: { $in: reviewerIds } }).select("name").lean()
    : [];
  const reviewerMap = new Map(reviewers.map((u) => [u._id.toString(), u.name]));

  const reviewCount = Number(reviewAgg?.[0]?.count || 0);
  const reviewAvg = Number((reviewAgg?.[0]?.avg || worker.ratingAvg || 0).toFixed(2));
  const quality = computeWorkerQuality({
    ...worker,
    ratingAvg: reviewAvg,
  });
  const historicalPricing = pricingAgg?.[0]
    ? {
        min: Math.round(Number(pricingAgg[0].min || 0)),
        max: Math.round(Number(pricingAgg[0].max || 0)),
        avg: Math.round(Number(pricingAgg[0].avg || 0)),
        sampleBookings: Number(pricingAgg[0].count || 0),
        currency: "INR",
      }
    : {
        min: 0,
        max: 0,
        avg: 0,
        sampleBookings: 0,
        currency: "INR",
      };

  const res = NextResponse.json({
    ok: true,
    worker: {
      ...worker,
      user: safeUser,
      contactUnlocked,
      canReview,
      isBoosted: Boolean(activeBoost),
      activeBoost,
      boostPlan,
      badges: {
        verified: worker.verificationStatus === "APPROVED" && worker.verificationFeePaid,
        kycQueueStatus: worker?.kyc?.queueStatus || "not_submitted",
        boosted: Boolean(activeBoost),
        topRated: quality.badges.topRated,
        fastResponse: quality.badges.fastResponse,
        lowCancel: quality.badges.lowCancel,
        trustedPro: quality.badges.trustedPro,
      },
      quality,
      availability: {
        isOnline: Boolean(worker.isOnline),
        statusText: worker.isOnline ? "Available now" : "Currently offline",
        responseTimeAvg: Number(worker.responseTimeAvg || 0),
        lastActiveAt: worker.lastActiveAt || null,
      },
      reviewSummary: {
        ratingAvg: reviewAvg,
        ratingCount: reviewCount,
      },
      recentReviews: reviews.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        reply: r.reply || null,
        createdAt: r.createdAt,
        userName: reviewerMap.get(r.userId?.toString()) || "User",
      })),
      pricing: {
        basePrice: Number(worker?.pricing?.basePrice || 0),
        extraServices: Array.isArray(worker?.pricing?.extraServices) ? worker.pricing.extraServices : [],
        currency: worker?.pricing?.currency || "INR",
      },
      historicalPricing,
      servicePricing: serviceOptions.map((service) => {
        const subtotal = Number(service.basePrice || 0) + Number(service.visitFee || 0);
        const tax = Math.round((subtotal * Number(service.taxPercent || 0)) / 100);
        return {
          serviceId: service._id,
          title: service.title,
          slug: service.slug,
          category: service.category,
          estimatedTotal: subtotal + tax,
          basePrice: Number(service.basePrice || 0),
          visitFee: Number(service.visitFee || 0),
          taxPercent: Number(service.taxPercent || 0),
        };
      }),
    },
  });
  return applyRefreshCookies(res, viewerAuth?.refreshedResponse || null);
}
