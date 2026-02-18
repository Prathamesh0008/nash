function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function computeWorkerQuality(worker = {}) {
  const ratingAvg = Math.max(0, toNumber(worker.ratingAvg, 0));
  const jobsCompleted = Math.max(0, toNumber(worker.jobsCompleted, 0));
  const cancelRate = Math.max(0, toNumber(worker.cancelRate, 0));
  const responseTimeAvg = Math.max(0, toNumber(worker.responseTimeAvg, 0));

  const ratingScore = Math.min(40, (ratingAvg / 5) * 40);
  const jobsScore = Math.min(25, jobsCompleted * 0.5);
  const cancelScore = Math.max(0, 20 - cancelRate * 0.8);
  const responseScore = Math.max(0, 15 - responseTimeAvg * 0.2);
  const qualityScore = Math.max(0, Math.min(100, Math.round(ratingScore + jobsScore + cancelScore + responseScore)));

  const badges = {
    topRated: ratingAvg >= 4.5 && jobsCompleted >= 10,
    fastResponse: responseTimeAvg > 0 && responseTimeAvg <= 20,
    lowCancel: cancelRate >= 0 && cancelRate <= 5,
    trustedPro: qualityScore >= 80 && jobsCompleted >= 20,
  };

  const autoFlags = [];
  if (jobsCompleted >= 8 && ratingAvg > 0 && ratingAvg < 3.5) {
    autoFlags.push("low_rating");
  }
  if (cancelRate >= 20) {
    autoFlags.push("high_cancel_rate");
  }
  if (responseTimeAvg >= 45) {
    autoFlags.push("slow_response");
  }
  if (jobsCompleted < 3 && ratingAvg > 0 && ratingAvg < 4) {
    autoFlags.push("new_worker_low_signal");
  }

  return {
    qualityScore,
    ratingAvg,
    jobsCompleted,
    cancelRate,
    responseTimeAvg,
    badges,
    autoFlags,
  };
}

