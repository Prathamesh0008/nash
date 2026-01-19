import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import Review from "@/models/Review";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, context) {
  await dbConnect();

  /* ✅ NEXT 15 PARAM FIX */
  const { id: workerUserId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(workerUserId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid worker id" },
      { status: 400 }
    );
  }

  /* ✅ ONLY ACTIVE WORKERS */
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

  /* 🔥 FETCH REVIEWS LIVE */
  const reviews = await Review.find({ workerUserId })
    .sort({ createdAt: -1 })
    .lean();

  /* 🔥 CALCULATE RATING LIVE */
  const ratingCount = reviews.length;
  const ratingAvg =
    ratingCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;

  return NextResponse.json({
    ok: true,
    worker: {
      /* ===== PROFILE ===== */
      ...profile,
      userId: workerUserId,
      email: user?.email || "",

      /* ===== REVIEWS (LIVE) ===== */
      reviews,
      ratingAvg,
      ratingCount,
    },
  });
}
