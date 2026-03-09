import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import ActiveBoost from "@/models/ActiveBoost";
import mongoose from "mongoose";
import { haversineKm, isValidLatLng } from "@/lib/geo";

function parseBoolean(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

const LIVE_LOCATION_MAX_AGE_MINUTES = Math.max(1, Number(process.env.WORKER_LIVE_LOCATION_MAX_AGE_MINUTES || 30));

function isLiveLocationFresh(recordedAt) {
  if (!recordedAt) return false;
  const ts = new Date(recordedAt).getTime();
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts <= LIVE_LOCATION_MAX_AGE_MINUTES * 60 * 1000;
}

function getWorkerNearestDistance(worker, userPoint) {
  if (!userPoint) return { distanceKm: null, locationSource: "none" };
  const livePoint = worker?.currentLocation || null;
  if (livePoint && isLiveLocationFresh(livePoint.recordedAt)) {
    const liveDistance = haversineKm(userPoint, livePoint);
    if (typeof liveDistance === "number") {
      return { distanceKm: liveDistance, locationSource: "live" };
    }
  }

  const areas = Array.isArray(worker?.serviceAreas) ? worker.serviceAreas : [];
  let nearest = null;
  for (const area of areas) {
    const distance = haversineKm(userPoint, area);
    if (distance === null) continue;
    if (nearest === null || distance < nearest) nearest = distance;
  }
  return { distanceKm: nearest, locationSource: nearest === null ? "none" : "service_area" };
}

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const city = (searchParams.get("city") || "").trim();
  const pincode = (searchParams.get("pincode") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const sort = (searchParams.get("sort") || "").trim().toLowerCase();
  const nearbyOnly = parseBoolean(searchParams.get("nearby"));
  const requestedMaxDistance = toNumber(searchParams.get("maxDistanceKm"));
  const maxDistanceKm = Math.max(1, requestedMaxDistance || 30);
  const lat = toNumber(searchParams.get("lat"));
  const lng = toNumber(searchParams.get("lng"));
  const userPoint = isValidLatLng(lat, lng) ? { lat, lng } : null;
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
    .map((worker) => {
      const distance = getWorkerNearestDistance(worker, userPoint);
      return {
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
      distanceKm: distance.distanceKm,
      locationSource: distance.locationSource,
    };
    })
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
    .filter((worker) => {
      if (!nearbyOnly) return true;
      if (!userPoint) return false;
      if (typeof worker.distanceKm !== "number") return false;
      return worker.distanceKm <= maxDistanceKm;
    })
    .sort((a, b) => {
      const sortNearby = Boolean(userPoint) && (nearbyOnly || sort === "nearby");
      if (sortNearby) {
        const aHas = typeof a.distanceKm === "number";
        const bHas = typeof b.distanceKm === "number";
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (aHas && bHas && a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      }
      if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;
      if (a.boostScore !== b.boostScore) return b.boostScore - a.boostScore;
      return Number(b.ratingAvg || 0) - Number(a.ratingAvg || 0);
    });

  return NextResponse.json({ ok: true, workers: rows });
}
