import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import Booking from "@/models/Booking";
import Report from "@/models/Report";
import Payment from "@/models/Payment";
import PromoCode from "@/models/PromoCode";
import Referral from "@/models/Referral";
import SupportTicket from "@/models/SupportTicket";
import Service from "@/models/Service";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    usersCount,
    workersCount,
    bookingsCount,
    paidBookingsCount,
    openReports,
    promosCount,
    referralsCount,
    paidAmount,
    bookingStatusAgg,
    pendingWorkerReviews,
    openSupportTickets,
    bookingsLast7Days,
    avgTicketAgg,
    dailyBookingsAgg,
    topAreasAgg,
    topCategoriesAgg,
    registeredWorkers,
    onboardedWorkers,
    submittedWorkers,
    approvedWorkers,
    liveWorkers,
    pendingReviewWorkers,
    onboardedNoSubmissionWorkers,
    activeServiceCategories,
    workerCategoryRows,
    duplicateWorkerPhonesAgg,
    duplicateWorkerEmailsAgg,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    WorkerProfile.countDocuments({}),
    Booking.countDocuments({}),
    Booking.countDocuments({ paymentStatus: "paid" }),
    Report.countDocuments({ status: { $in: ["open", "investigating"] } }),
    PromoCode.countDocuments({}),
    Referral.countDocuments({}),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    WorkerProfile.countDocuments({ "kyc.queueStatus": { $in: ["pending_review", "in_review"] } }),
    SupportTicket.countDocuments({ status: { $in: ["open", "in_progress"] } }),
    Booking.countDocuments({ createdAt: { $gte: last7Days } }),
    Booking.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, avg: { $avg: "$priceBreakup.total" } } },
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]),
    Booking.aggregate([
      { $match: { "address.city": { $exists: true, $ne: "" } } },
      { $group: { _id: "$address.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Booking.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      { $group: { _id: "$service.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    WorkerProfile.countDocuments({ accountStatus: "REGISTERED" }),
    WorkerProfile.countDocuments({ accountStatus: { $in: ["ONBOARDED", "LIVE"] } }),
    WorkerProfile.countDocuments({ "kyc.submittedAt": { $ne: null } }),
    WorkerProfile.countDocuments({ verificationStatus: "APPROVED" }),
    WorkerProfile.countDocuments({ accountStatus: "LIVE" }),
    WorkerProfile.countDocuments({ "kyc.queueStatus": { $in: ["pending_review", "in_review"] } }),
    WorkerProfile.countDocuments({ accountStatus: "ONBOARDED", "kyc.submittedAt": null }),
    Service.distinct("category", { active: true }),
    WorkerProfile.find({}).select("categories").lean(),
    User.aggregate([
      { $match: { role: "worker", phone: { $exists: true, $nin: ["", null] } } },
      { $group: { _id: "$phone", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    User.aggregate([
      { $match: { role: "worker", email: { $exists: true, $nin: ["", null] } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
  ]);

  const revenue = paidAmount?.[0]?.total || 0;
  const bookingByStatus = (bookingStatusAgg || []).reduce((acc, row) => {
    const key = String(row?._id || "unknown");
    acc[key] = Number(row?.count || 0);
    return acc;
  }, {});
  const completedBookings = Number(bookingByStatus.completed || 0);
  const cancelledBookings = Number(bookingByStatus.cancelled || 0);
  const completionRate = bookingsCount > 0 ? Math.round((completedBookings / bookingsCount) * 100) : 0;
  const cancelRate = bookingsCount > 0 ? Math.round((cancelledBookings / bookingsCount) * 100) : 0;
  const paidBookingRate = bookingsCount > 0 ? Math.round((paidBookingsCount / bookingsCount) * 100) : 0;
  const avgTicketSize = Math.round(Number(avgTicketAgg?.[0]?.avg || 0));

  const dailyBookings = (dailyBookingsAgg || []).map((row) => ({
    date: `${row._id.y}-${String(row._id.m).padStart(2, "0")}-${String(row._id.d).padStart(2, "0")}`,
    count: Number(row.count || 0),
  }));
  const topAreas = (topAreasAgg || []).map((row) => ({ city: String(row._id || "-"), count: Number(row.count || 0) }));
  const topCategories = (topCategoriesAgg || []).map((row) => ({ category: String(row._id || "-"), count: Number(row.count || 0) }));

  const serviceCategorySet = new Set((activeServiceCategories || []).map((row) => String(row || "").trim().toLowerCase()).filter(Boolean));
  let workerCategoryMismatchCount = 0;
  const unknownCategoriesMap = new Map();
  for (const row of workerCategoryRows || []) {
    const categories = Array.isArray(row?.categories) ? row.categories : [];
    const unknown = categories
      .map((cat) => String(cat || "").trim().toLowerCase())
      .filter((cat) => cat && !serviceCategorySet.has(cat));
    if (unknown.length > 0) {
      workerCategoryMismatchCount += 1;
      unknown.forEach((cat) => {
        unknownCategoriesMap.set(cat, (unknownCategoriesMap.get(cat) || 0) + 1);
      });
    }
  }
  const unknownWorkerCategories = [...unknownCategoriesMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category, count]) => ({ category, count }));

  const onboardingFunnel = {
    registeredWorkers: Number(registeredWorkers || 0),
    onboardedWorkers: Number(onboardedWorkers || 0),
    submittedWorkers: Number(submittedWorkers || 0),
    pendingReviewWorkers: Number(pendingReviewWorkers || 0),
    approvedWorkers: Number(approvedWorkers || 0),
    liveWorkers: Number(liveWorkers || 0),
    dropOff: {
      registeredNoOnboarding: Math.max(0, Number(registeredWorkers || 0)),
      onboardedNoSubmission: Number(onboardedNoSubmissionWorkers || 0),
      submittedNotApproved: Math.max(0, Number(submittedWorkers || 0) - Number(approvedWorkers || 0)),
    },
  };

  const dataConsistency = {
    workerCategoryMismatchCount,
    unknownWorkerCategories,
    duplicateWorkerPhonesCount: Number((duplicateWorkerPhonesAgg || []).length || 0),
    duplicateWorkerEmailsCount: Number((duplicateWorkerEmailsAgg || []).length || 0),
    duplicateWorkerPhones: (duplicateWorkerPhonesAgg || []).map((row) => ({ phone: row._id, count: row.count })),
    duplicateWorkerEmails: (duplicateWorkerEmailsAgg || []).map((row) => ({ email: row._id, count: row.count })),
  };

  const res = NextResponse.json({
    ok: true,
    metrics: {
      usersCount,
      workersCount,
      bookingsCount,
      paidBookingsCount,
      openReports,
      promosCount,
      referralsCount,
      revenue,
      bookingByStatus,
      completionRate,
      cancelRate,
      paidBookingRate,
      pendingWorkerReviews,
      openSupportTickets,
      bookingsLast7Days,
      avgTicketSize,
      dailyBookings,
      topAreas,
      topCategories,
      onboardingFunnel,
      dataConsistency,
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
