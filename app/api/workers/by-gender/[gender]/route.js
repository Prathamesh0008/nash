import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  await dbConnect();

  // ✅ Next 15 param unwrap
  const { gender } = await context.params;

  if (!["male", "female"].includes(gender)) {
    return NextResponse.json(
      { ok: false, error: "Invalid gender" },
      { status: 400 }
    );
  }

  const profiles = await WorkerProfile.find({
    gender,
    status: "active",
  }).lean();

  const userIds = profiles.map((p) => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();

  const userMap = {};
  users.forEach((u) => (userMap[u._id.toString()] = u));

 const workers = profiles.map((p) => ({
  id: p.userId.toString(),     // ✅ THIS IS THE FIX
  name: p.fullName || "Worker",
  city: p.city || "",
  photoUrl: p.profilePhoto || "",
  ratingAvg: p.ratingAvg || 0,
  ratingCount: p.ratingCount || 0,
  services: (p.services || []).map((s) => s.name),
}));


  return NextResponse.json({ ok: true, workers });
}
