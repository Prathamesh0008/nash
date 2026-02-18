import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  const workers = await WorkerProfile.find({
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
  })
    .sort({ ratingAvg: -1 })
    .limit(200)
    .lean();

  const users = await User.find({ _id: { $in: workers.map((w) => w.userId) } }).select("name").lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const rows = workers.map((worker) => ({
    id: worker.userId,
    name: userMap.get(worker.userId.toString())?.name || "Worker",
    profilePhoto: worker.profilePhoto,
    ratingAvg: worker.ratingAvg,
    jobsCompleted: worker.jobsCompleted,
    isOnline: worker.isOnline,
  }));

  return NextResponse.json({ ok: true, workers: rows });
}