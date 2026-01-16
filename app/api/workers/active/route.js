import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const profiles = await WorkerProfile.find({ status: "active" }).lean();

  const userIds = profiles.map((p) => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const map = {};
  users.forEach((u) => (map[u._id.toString()] = u));

  const result = profiles.map((p) => ({
    id: p.userId, // worker "userId" acts like worker id
    name: map[p.userId.toString()]?.name || "Worker",
    city: p.city,
    services: p.services,
    photoUrl: p.photoUrl,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
  }));

  return NextResponse.json({ ok: true, workers: result });
}
