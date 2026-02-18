import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import WorkerProfile from "@/models/WorkerProfile";
import ActiveBoost from "@/models/ActiveBoost";
import User from "@/models/User";
import { computeWorkerScore } from "@/lib/matching";

export async function GET(req, context) {
  await dbConnect();

  const { slug } = await context.params;
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get("city") || "").trim();
  const pincode = (searchParams.get("pincode") || "").trim();

  const service = await Service.findOne({ slug, active: true }).lean();
  if (!service) {
    return NextResponse.json({ ok: false, error: "Service not found" }, { status: 404 });
  }

  const areaMatch = [];
  if (city) areaMatch.push({ city: { $regex: `^${city}$`, $options: "i" } });
  if (pincode) areaMatch.push({ pincode });

  const workerFilter = {
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
    categories: service.category,
  };

  if (areaMatch.length > 0) {
    workerFilter.serviceAreas = { $elemMatch: { $or: areaMatch } };
  }

  const workers = await WorkerProfile.find(workerFilter).limit(100).lean();
  const userIds = workers.map((w) => w.userId);
  const users = await User.find({ _id: { $in: userIds } }).select("name avatarUrl").lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const activeBoosts = await ActiveBoost.find({
    workerId: { $in: userIds },
    status: "active",
    startAt: { $lte: new Date() },
    endAt: { $gte: new Date() },
    ...(city ? { $or: [{ area: city }, { area: "" }] } : {}),
    $or: [{ category: service.category }, { category: "" }],
  }).lean();

  const boostMap = new Map();
  for (const boost of activeBoosts) {
    const key = boost.workerId.toString();
    const prev = boostMap.get(key) || 0;
    boostMap.set(key, Math.max(prev, boost.boostScore || 0));
  }

  const ranked = workers
    .map((worker) => {
      const completionRate = Math.max(0, 100 - Number(worker.cancelRate || 0));
      const penalty = (worker.penalties?.reportFlags || 0) * 15 + (worker.penalties?.noShows || 0) * 20;
      const boostScore = boostMap.get(worker.userId.toString()) || 0;
      const finalScore = computeWorkerScore({
        boostScore,
        ratingAvg: Number(worker.ratingAvg || 0),
        completionRate,
        cancelRate: Number(worker.cancelRate || 0),
        responseTimeAvg: Number(worker.responseTimeAvg || 0),
        penalty,
      });

      const workerUser = userMap.get(worker.userId.toString());
      return {
        id: worker.userId,
        name: workerUser?.name || "Worker",
        profilePhoto: worker.profilePhoto || workerUser?.avatarUrl || "",
        galleryPhotos: worker.galleryPhotos || [],
        ratingAvg: Number(worker.ratingAvg || 0),
        jobsCompleted: Number(worker.jobsCompleted || 0),
        isOnline: Boolean(worker.isOnline),
        distanceKm: null,
        boostScore,
        finalScore,
        featured: boostScore > 0,
        serviceAreas: worker.serviceAreas || [],
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  return NextResponse.json({ ok: true, service, workers: ranked });
}
