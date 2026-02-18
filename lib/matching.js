import ActiveBoost from "@/models/ActiveBoost";
import WorkerProfile from "@/models/WorkerProfile";
import Booking from "@/models/Booking";
import { isWorkerAvailableForSlot } from "@/lib/availability";

const ACTIVE_SLOT_STATUSES = ["confirmed", "assigned", "onway", "working"];

export function computeWorkerScore({ boostScore = 0, ratingAvg = 0, completionRate = 0, cancelRate = 0, responseTimeAvg = 0, penalty = 0 }) {
  const ratingScore = ratingAvg * 20;
  const performanceScore = Math.max(0, completionRate * 40 - cancelRate * 25 - responseTimeAvg * 0.1);
  return boostScore + ratingScore + performanceScore - penalty;
}

export async function getWorkerBoostScore({ workerId, area = "", category = "", now = new Date() }) {
  const match = {
    workerId,
    status: "active",
    startAt: { $lte: now },
    endAt: { $gte: now },
  };

  if (area) {
    match.$or = [{ area }, { area: "" }];
  }

  if (category) {
    match.$and = [{ $or: [{ category }, { category: "" }] }];
  }

  const boosts = await ActiveBoost.find(match).sort({ boostScore: -1 }).lean();
  return boosts[0]?.boostScore || 0;
}

export async function matchWorkerForBooking({ category, areaPincode, areaCity, slotTime, excludeWorkerIds = [] }) {
  const excluded = new Set(
    (Array.isArray(excludeWorkerIds) ? excludeWorkerIds : [])
      .filter(Boolean)
      .map((id) => String(id))
  );

  const filters = {
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
    categories: category,
    serviceAreas: {
      $elemMatch: {
        $or: [{ pincode: areaPincode }, { city: { $regex: `^${areaCity}$`, $options: "i" } }],
      },
    },
  };

  const workers = await WorkerProfile.find(filters).lean();
  const availableWorkers = workers.filter(
    (worker) => !excluded.has(String(worker.userId)) && isWorkerAvailableForSlot(worker, slotTime)
  );
  if (availableWorkers.length === 0) return null;

  const candidateWorkerIds = availableWorkers.map((worker) => worker.userId).filter(Boolean);
  if (candidateWorkerIds.length === 0) return null;

  const slotConflicts = await Booking.find({
    workerId: { $in: candidateWorkerIds },
    slotTime,
    status: { $in: ACTIVE_SLOT_STATUSES },
  })
    .select("workerId")
    .lean();
  const busyWorkerIds = new Set(slotConflicts.map((row) => String(row.workerId)));
  const eligibleWorkers = availableWorkers.filter((worker) => !busyWorkerIds.has(String(worker.userId)));
  if (eligibleWorkers.length === 0) return null;

  const scored = await Promise.all(
    eligibleWorkers.map(async (worker) => {
      const boostScore = await getWorkerBoostScore({ workerId: worker.userId, area: areaCity, category });
      const completionRate = Math.max(0, 100 - Number(worker.cancelRate || 0));
      const penalty = (worker.penalties?.reportFlags || 0) * 15 + (worker.penalties?.noShows || 0) * 20;
      const score = computeWorkerScore({
        boostScore,
        ratingAvg: Number(worker.ratingAvg || 0),
        completionRate,
        cancelRate: Number(worker.cancelRate || 0),
        responseTimeAvg: Number(worker.responseTimeAvg || 0),
        penalty,
      });

      return { worker, boostScore, score };
    })
  );

  scored.sort((a, b) => b.score - a.score);
  return scored[0] || null;
}
