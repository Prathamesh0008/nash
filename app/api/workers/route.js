import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import ActiveBoost from "@/models/ActiveBoost";
import mongoose from "mongoose";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const city = (searchParams.get("city") || "").trim();
  const pincode = (searchParams.get("pincode") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const ids = String(searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const filter = {
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
  };

  if (category) filter.categories = category;
  if (ids.length > 0) {
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    filter.userId = { $in: validIds };
  }

  if (city || pincode) {
    const area = [];
    if (city) area.push({ city: { $regex: `^${city}$`, $options: "i" } });
    if (pincode) area.push({ pincode });
    filter.serviceAreas = { $elemMatch: { $or: area } };
  }

  const workers = await WorkerProfile.find(filter).sort({ ratingAvg: -1 }).limit(200).lean();
  const users = await User.find({ _id: { $in: workers.map((w) => w.userId) } }).select("name").lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const workerIds = workers.map((worker) => worker.userId);
  const boosts = await ActiveBoost.find({
    workerId: { $in: workerIds },
    status: "active",
    startAt: { $lte: new Date() },
    endAt: { $gte: new Date() },
  })
    .sort({ boostScore: -1 })
    .lean();
  const boostMap = new Map();
  for (const boost of boosts) {
    const key = boost.workerId.toString();
    if (!boostMap.has(key)) {
      boostMap.set(key, boost);
    }
  }

  const rows = workers
    .map((worker) => ({
      id: worker.userId,
      name: userMap.get(worker.userId.toString())?.name || "Worker",
      profilePhoto: worker.profilePhoto,
      galleryPhotos: worker.galleryPhotos,
      bio: worker.bio,
      skills: worker.skills,
      categories: worker.categories,
      serviceAreas: worker.serviceAreas,
      basePrice: Number(worker?.pricing?.basePrice || 0),
      currency: worker?.pricing?.currency || "INR",
      ratingAvg: worker.ratingAvg,
      jobsCompleted: worker.jobsCompleted,
      isOnline: worker.isOnline,
      verificationStatus: worker.verificationStatus,
      isBoosted: boostMap.has(worker.userId.toString()),
      boostScore: boostMap.get(worker.userId.toString())?.boostScore || 0,
    }))
    .filter((worker) => {
      if (!q) return true;
      const name = String(worker.name || "").toLowerCase();
      const skills = (worker.skills || []).join(" ").toLowerCase();
      const categories = (worker.categories || []).join(" ").toLowerCase();
      const areas = (worker.serviceAreas || [])
        .map((area) => `${area.city || ""} ${area.pincode || ""}`)
        .join(" ")
        .toLowerCase();
      return name.includes(q) || skills.includes(q) || categories.includes(q) || areas.includes(q);
    })
    .sort((a, b) => {
      if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;
      if (a.boostScore !== b.boostScore) return b.boostScore - a.boostScore;
      return Number(b.ratingAvg || 0) - Number(a.ratingAvg || 0);
    });

  return NextResponse.json({ ok: true, workers: rows });
}
