import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  await dbConnect();

  // ✅ unwrap params (IMPORTANT)
  const { id: workerUserId } = await context.params;

  const profile = await WorkerProfile.findOne({
    userId: workerUserId,
    status: "active",
  }).lean();

  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Worker not found" },
      { status: 404 }
    );
  }

  const user = await User.findById(workerUserId).lean();

  return NextResponse.json({
    ok: true,
    worker: {
      id: workerUserId,
      name: user?.name || "Worker",
      city: profile.city,
      phone: profile.phone,
      services: profile.services,
      availability: profile.availability,
      photoUrl: profile.photoUrl,
      ratingAvg: profile.ratingAvg,
      ratingCount: profile.ratingCount,
    },
  });
}
