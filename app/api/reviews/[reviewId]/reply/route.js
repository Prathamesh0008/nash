import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notify";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { reviewId } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return NextResponse.json({ ok: false, error: "Invalid review id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const text = String(body.text || "").trim();
  if (!text) return NextResponse.json({ ok: false, error: "Reply text required" }, { status: 400 });

  const review = await Review.findById(reviewId);
  if (!review) return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });

  if (user.role === "worker" && review.workerUserId?.toString() !== user.userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  review.reply = { text, repliedAt: new Date() };
  await review.save();

  await createNotification({
    userId: review.userId,
    actorId: user.userId,
    type: "review_reply",
    title: "Worker replied to your review",
    body: text,
    href: "/orders",
    meta: { reviewId: review._id.toString(), replyText: text },
  });

  const res = NextResponse.json({ ok: true, review });
  return applyRefreshCookies(res, refreshedResponse);
}