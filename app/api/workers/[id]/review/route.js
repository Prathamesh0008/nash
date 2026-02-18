import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notify";

export async function POST(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "admin"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const rating = Number(body.rating || 0);
  const comment = String(body.comment || "").trim();

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: "Rating must be 1 to 5" }, { status: 400 });
  }
  if (comment.length < 3) {
    return NextResponse.json({ ok: false, error: "Review comment must be at least 3 characters" }, { status: 400 });
  }

  const completedBooking = await Booking.findOne({
    userId: user.userId,
    workerId: id,
    status: "completed",
  }).lean();

  if (!completedBooking) {
    return NextResponse.json({ ok: false, error: "Completed booking required for review" }, { status: 400 });
  }

  const review = await Review.findOneAndUpdate(
    { userId: user.userId, workerUserId: id },
    { $set: { rating, comment } },
    { upsert: true, new: true }
  );

  const agg = await Review.aggregate([
    { $match: { workerUserId: new mongoose.Types.ObjectId(id) } },
    { $group: { _id: "$workerUserId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await WorkerProfile.updateOne(
    { userId: id },
    {
      $set: {
        ratingAvg: Number((agg?.[0]?.avg || 0).toFixed(2)),
      },
    }
  );

  await createNotification({
    userId: id,
    actorId: user.userId,
    type: "review",
    title: "New review received",
    body: `${rating} star rating submitted`,
    href: "/worker/reports",
    meta: { reviewId: review._id.toString() },
  });

  const res = NextResponse.json({ ok: true, review });
  return applyRefreshCookies(res, refreshedResponse);
}
