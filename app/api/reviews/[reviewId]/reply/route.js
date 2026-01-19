import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req, context) {
  await dbConnect();

  /* 🔐 AUTH */
  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded || decoded.role !== "worker") {
    return NextResponse.json(
      { ok: false, error: "Only workers can reply" },
      { status: 403 }
    );
  }

  /* ✅ NEXT 15 FIX — UNWRAP PARAMS */
  const { reviewId } = await context.params;

  if (!reviewId) {
    return NextResponse.json(
      { ok: false, error: "Review ID missing" },
      { status: 400 }
    );
  }

  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Reply text required" },
      { status: 400 }
    );
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    return NextResponse.json(
      { ok: false, error: "Review not found" },
      { status: 404 }
    );
  }

  /* ✅ OWNERSHIP CHECK */
  if (review.workerUserId.toString() !== decoded.userId) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  /* ✅ SAVE REPLY */
  review.reply = {
    text,
    repliedAt: new Date(),
  };

  await review.save();

  return NextResponse.json({ ok: true });
}
