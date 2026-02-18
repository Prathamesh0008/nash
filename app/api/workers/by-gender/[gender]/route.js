import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";

export async function GET(req, context) {
  await dbConnect();
  const { gender } = await context.params;
  const requestedGender = ["male", "female", "other"].includes(gender) ? gender : "";

  const filter = {
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
  };

  const workers = await WorkerProfile.find(filter).sort({ ratingAvg: -1 }).limit(200).lean();
  const users = await User.find({ _id: { $in: workers.map((w) => w.userId) } }).select("name gender").lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const rows = workers
    .map((worker) => {
      const linkedUser = userMap.get(worker.userId.toString());
      return {
        id: worker.userId,
        name: linkedUser?.name || "Worker",
        gender: worker.gender || linkedUser?.gender || "other",
        profilePhoto: worker.profilePhoto,
        ratingAvg: worker.ratingAvg,
        jobsCompleted: worker.jobsCompleted,
        isOnline: worker.isOnline,
      };
    })
    .filter((row) => (requestedGender ? row.gender === requestedGender : true));

  return NextResponse.json({ ok: true, workers: rows });
}
