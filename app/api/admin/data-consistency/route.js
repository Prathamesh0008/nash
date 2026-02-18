import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import Service from "@/models/Service";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";

function toLowerTrim(value = "") {
  return String(value || "").trim().toLowerCase();
}

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const [serviceCategories, workerProfiles, duplicateProfileByUserAgg, duplicatePhoneAgg, duplicateEmailAgg] = await Promise.all([
    Service.distinct("category", { active: true }),
    WorkerProfile.find({}).select("userId categories verificationStatus accountStatus").lean(),
    WorkerProfile.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]),
    User.aggregate([
      { $match: { role: "worker", phone: { $exists: true, $nin: ["", null] } } },
      { $group: { _id: "$phone", count: { $sum: 1 }, users: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]),
    User.aggregate([
      { $match: { role: "worker", email: { $exists: true, $nin: ["", null] } } },
      { $group: { _id: "$email", count: { $sum: 1 }, users: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]),
  ]);

  const categorySet = new Set((serviceCategories || []).map((row) => toLowerTrim(row)).filter(Boolean));
  const userIds = [...new Set((workerProfiles || []).map((row) => String(row.userId || "")).filter(Boolean))];
  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select("name email phone").lean()
    : [];
  const userMap = new Map(users.map((row) => [String(row._id), row]));

  const workerCategoryMismatches = [];
  for (const worker of workerProfiles || []) {
    const categories = Array.isArray(worker.categories) ? worker.categories : [];
    const unknownCategories = categories
      .map((row) => toLowerTrim(row))
      .filter((row) => row && !categorySet.has(row));
    if (unknownCategories.length === 0) continue;
    workerCategoryMismatches.push({
      workerId: String(worker.userId || ""),
      workerName: userMap.get(String(worker.userId || ""))?.name || "",
      workerEmail: userMap.get(String(worker.userId || ""))?.email || "",
      workerPhone: userMap.get(String(worker.userId || ""))?.phone || "",
      verificationStatus: worker.verificationStatus || "",
      accountStatus: worker.accountStatus || "",
      unknownCategories: [...new Set(unknownCategories)],
    });
  }

  const res = NextResponse.json({
    ok: true,
    consistency: {
      serviceCategories: (serviceCategories || []).map((row) => String(row || "")),
      workerCategoryMismatchCount: workerCategoryMismatches.length,
      workerCategoryMismatches: workerCategoryMismatches.slice(0, 200),
      duplicateWorkerProfileByUserCount: (duplicateProfileByUserAgg || []).length,
      duplicateWorkerProfileByUser: (duplicateProfileByUserAgg || []).map((row) => ({
        userId: String(row._id || ""),
        count: Number(row.count || 0),
      })),
      duplicateWorkerPhonesCount: (duplicatePhoneAgg || []).length,
      duplicateWorkerPhones: (duplicatePhoneAgg || []).map((row) => ({
        phone: String(row._id || ""),
        count: Number(row.count || 0),
        userIds: (row.users || []).map((id) => String(id)),
      })),
      duplicateWorkerEmailsCount: (duplicateEmailAgg || []).length,
      duplicateWorkerEmails: (duplicateEmailAgg || []).map((row) => ({
        email: String(row._id || ""),
        count: Number(row.count || 0),
        userIds: (row.users || []).map((id) => String(id)),
      })),
    },
  });

  return applyRefreshCookies(res, refreshedResponse);
}

