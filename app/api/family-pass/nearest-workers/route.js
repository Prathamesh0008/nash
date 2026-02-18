import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Service from "@/models/Service";
import Booking from "@/models/Booking";
import WorkerProfile from "@/models/WorkerProfile";
import MembershipPlan from "@/models/MembershipPlan";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { getActiveMembershipForUser, isFamilyPassMembership, isFamilyPassPlan } from "@/lib/membership";
import { isWorkerAvailableForSlot } from "@/lib/availability";
import { haversineKm, pickLatLngFromValue, toGeoPoint } from "@/lib/geo";

const ACTIVE_SLOT_STATUSES = ["confirmed", "assigned", "onway", "working"];
const DEFAULT_MAX_KM = Math.max(5, Number(process.env.FAMILY_PASS_NEAREST_MAX_KM || 30));

function pickPrimaryAddress(user) {
  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];
  return addresses.find((row) => row?.isDefault) || addresses[0] || null;
}

function toLocalIsoForInput(date) {
  const dt = new Date(date);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function getWorkerAreaByBestDistance(worker, userAddress) {
  const areas = Array.isArray(worker?.serviceAreas) ? worker.serviceAreas : [];
  const myPincode = String(userAddress?.pincode || "").trim();
  const myCity = String(userAddress?.city || "").trim().toLowerCase();

  let best = { area: null, proximityLabel: "Nearby", proximityScore: 0, distanceKm: null };
  for (const area of areas) {
    const areaPincode = String(area?.pincode || "").trim();
    const areaCity = String(area?.city || "").trim().toLowerCase();
    const distanceKm = haversineKm(userAddress, area);

    let proximityLabel = "Nearby";
    let proximityScore = 0;
    if (myPincode && areaPincode && myPincode === areaPincode) {
      proximityLabel = "Same pincode";
      proximityScore = 4;
    } else if (myCity && areaCity && myCity === areaCity) {
      proximityLabel = "Same city";
      proximityScore = 2;
    }

    const currentDistance = best.distanceKm == null ? Number.MAX_SAFE_INTEGER : best.distanceKm;
    const candidateDistance = distanceKm == null ? Number.MAX_SAFE_INTEGER : distanceKm;
    const betterByScore = proximityScore > best.proximityScore;
    const betterByDistance = proximityScore === best.proximityScore && candidateDistance < currentDistance;

    if (!best.area || betterByScore || betterByDistance) {
      best = { area, proximityLabel, proximityScore, distanceKm };
    }
  }
  return best;
}

function computeWorkerScore(worker, distanceKm, proximityScore) {
  const rating = Number(worker?.ratingAvg || 0);
  const jobs = Number(worker?.jobsCompleted || 0);
  const responseMins = Number(worker?.responseTimeAvg || 0);
  const responseBonus = Math.max(0, 60 - responseMins) / 10;
  const jobsBonus = Math.min(12, jobs * 0.12);
  const distanceBonus = distanceKm == null ? proximityScore * 8 : Math.max(0, 32 - distanceKm);
  return distanceBonus + rating * 11 + jobsBonus + responseBonus;
}

function estimateArrivalMinutes({ distanceKm, responseTimeAvg }) {
  const distancePart =
    distanceKm == null ? 25 : Math.max(5, Math.min(60, Math.round((Number(distanceKm || 0) / 0.5) * 3)));
  const responsePart = Math.max(5, Math.min(45, Math.round(Number(responseTimeAvg || 0))));
  return Math.round((distancePart + responsePart) / 2);
}

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user"] });
  if (errorResponse) return errorResponse;

  const activeMembership = await getActiveMembershipForUser({ userId: user.userId });
  let activePlan = null;
  if (activeMembership?.planId) {
    activePlan = await MembershipPlan.findById(activeMembership.planId).select("code name").lean();
  }
  const isFamilyPass = isFamilyPassMembership(activeMembership) || isFamilyPassPlan(activePlan || {});
  if (!isFamilyPass) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[family-pass][nearest-workers] access denied", {
        userId: user.userId,
        membershipId: activeMembership?._id?.toString?.() || "",
        snapshotCode: String(activeMembership?.planSnapshot?.code || ""),
        snapshotName: String(activeMembership?.planSnapshot?.name || ""),
        planCode: String(activePlan?.code || ""),
        planName: String(activePlan?.name || ""),
      });
    }
    const res = NextResponse.json(
      {
        ok: false,
        memberOnly: true,
        redirectHref: "/membership?plan=FAMILY",
        error: "This endpoint is only for Family Pass members.",
        currentPlan: activeMembership
          ? {
              code: String(activeMembership?.planSnapshot?.code || activePlan?.code || "").trim().toUpperCase(),
              name: activeMembership?.planSnapshot?.name || activePlan?.name || "",
              endsAt: activeMembership?.endsAt || null,
            }
          : null,
      },
      { status: 403 }
    );
    return applyRefreshCookies(res, refreshedResponse);
  }

  const me = await User.findById(user.userId).select("addresses").lean();
  const myAddress = pickPrimaryAddress(me);
  if (!myAddress) {
    const res = NextResponse.json({
      ok: true,
      workers: [],
      note: "Add a default address to see nearest workers.",
    });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const { searchParams } = new URL(req.url);
  const serviceId = String(searchParams.get("serviceId") || "").trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 12), 1), 30);
  const slotParam = String(searchParams.get("slotTime") || "").trim();
  const maxKm = Math.min(Math.max(Number(searchParams.get("maxKm") || DEFAULT_MAX_KM), 3), 80);

  const slotTime = slotParam ? new Date(slotParam) : new Date(Date.now() + 60 * 60 * 1000);
  if (Number.isNaN(slotTime.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid slotTime" }, { status: 400 });
  }

  let service = null;
  if (serviceId) {
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json({ ok: false, error: "Invalid serviceId" }, { status: 400 });
    }
    service = await Service.findById(serviceId).select("title category").lean();
    if (!service) {
      return NextResponse.json({ ok: false, error: "Service not found" }, { status: 404 });
    }
  }

  const baseQuery = {
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
    ...(service?.category ? { categories: service.category } : {}),
  };

  const myLatLng = pickLatLngFromValue(myAddress);
  let candidates = [];
  let mode = "fallback";

  if (myLatLng) {
    const geoPoint = toGeoPoint(myLatLng.lat, myLatLng.lng);
    const geoRows = await WorkerProfile.aggregate([
      {
        $geoNear: {
          near: geoPoint,
          distanceField: "distanceMeters",
          spherical: true,
          key: "serviceAreas.location",
          maxDistance: maxKm * 1000,
          query: baseQuery,
        },
      },
      { $limit: Math.max(limit * 4, 30) },
    ]);

    if (geoRows.length > 0) {
      mode = "geo";
      candidates = geoRows.map((row) => ({
        ...row,
        distanceKm: Number((Number(row.distanceMeters || 0) / 1000).toFixed(2)),
      }));
    }
  }

  if (candidates.length === 0) {
    const cityRegex = new RegExp(`^${String(myAddress.city || "").trim()}$`, "i");
    const filters = {
      ...baseQuery,
      serviceAreas: {
        $elemMatch: {
          $or: [{ pincode: String(myAddress.pincode || "").trim() }, { city: cityRegex }],
        },
      },
    };

    const rows = await WorkerProfile.find(filters).limit(Math.max(limit * 4, 30)).lean();
    candidates = rows.map((row) => ({ ...row, distanceKm: null }));
  }

  if (candidates.length === 0) {
    const res = NextResponse.json({
      ok: true,
      workers: [],
      mode,
      slotTime: slotTime.toISOString(),
      slotLocal: toLocalIsoForInput(slotTime),
      note: "No workers found near your location for this service.",
    });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const availableWorkers = candidates.filter((worker) => isWorkerAvailableForSlot(worker, slotTime));
  if (availableWorkers.length === 0) {
    const res = NextResponse.json({
      ok: true,
      workers: [],
      mode,
      slotTime: slotTime.toISOString(),
      slotLocal: toLocalIsoForInput(slotTime),
      note: "Nearby workers exist but are not available at the selected slot.",
    });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const candidateWorkerIds = availableWorkers.map((worker) => worker.userId).filter(Boolean);
  const conflicts = await Booking.find({
    workerId: { $in: candidateWorkerIds },
    slotTime,
    status: { $in: ACTIVE_SLOT_STATUSES },
  })
    .select("workerId")
    .lean();
  const busyWorkerIdSet = new Set(conflicts.map((row) => String(row.workerId)));

  const finalCandidates = availableWorkers.filter((worker) => !busyWorkerIdSet.has(String(worker.userId)));
  if (finalCandidates.length === 0) {
    const res = NextResponse.json({
      ok: true,
      workers: [],
      mode,
      slotTime: slotTime.toISOString(),
      slotLocal: toLocalIsoForInput(slotTime),
      note: "Nearby workers are currently busy at this slot.",
    });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const users = await User.find({ _id: { $in: finalCandidates.map((w) => w.userId) } })
    .select("name")
    .lean();
  const userMap = new Map(users.map((row) => [String(row._id), row]));

  const ranked = finalCandidates
    .map((worker) => {
      const areaMeta = getWorkerAreaByBestDistance(worker, myAddress);
      const distanceKm = worker.distanceKm != null ? Number(worker.distanceKm) : areaMeta.distanceKm;
      const score = computeWorkerScore(worker, distanceKm, areaMeta.proximityScore);
      const estimatedArrivalMinutes = estimateArrivalMinutes({
        distanceKm,
        responseTimeAvg: Number(worker.responseTimeAvg || 0),
      });
      return {
        workerId: worker.userId,
        name: userMap.get(String(worker.userId))?.name || "Worker",
        city: areaMeta.area?.city || worker.serviceAreas?.[0]?.city || "",
        pincode: areaMeta.area?.pincode || worker.serviceAreas?.[0]?.pincode || "",
        proximity: areaMeta.proximityLabel,
        ratingAvg: Number(worker.ratingAvg || 0),
        jobsCompleted: Number(worker.jobsCompleted || 0),
        responseTimeAvg: Number(worker.responseTimeAvg || 0),
        distanceKm: distanceKm == null ? null : Number(distanceKm.toFixed(2)),
        score: Number(score.toFixed(2)),
        estimatedArrivalMinutes,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row, idx) => ({
      ...row,
      priorityQueuePosition: idx + 1,
      priorityLane: "family_pass",
    }));

  const fasterRecommendations = [...ranked]
    .sort((a, b) => Number(a.estimatedArrivalMinutes || 999) - Number(b.estimatedArrivalMinutes || 999))
    .slice(0, Math.min(3, ranked.length))
    .map((row) => ({
      workerId: row.workerId,
      name: row.name,
      estimatedArrivalMinutes: row.estimatedArrivalMinutes,
      priorityQueuePosition: row.priorityQueuePosition,
    }));

  const res = NextResponse.json({
    ok: true,
    priorityQueueVisible: true,
    mode,
    slotTime: slotTime.toISOString(),
    slotLocal: toLocalIsoForInput(slotTime),
    service: service
      ? {
          serviceId: service._id,
          title: service.title,
          category: service.category,
        }
      : null,
    workers: ranked,
    fasterRecommendations,
    note:
      mode === "geo"
        ? "Family Pass priority queue active. Ranked by true map distance (km), availability, and performance."
        : "Family Pass priority queue active. Geo coordinates missing for some users/workers, fallback ranking used.",
  });
  return applyRefreshCookies(res, refreshedResponse);
}
