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

  if (!decoded || decoded.role !== "user") {
    return NextResponse.json(
      { ok: false, error: "Login required" },
      { status: 401 }
    );
  }

  /* ✅ NEXT 15 FIX — UNWRAP PARAMS */
  const { id: workerUserId } = await context.params;

  if (!workerUserId) {
    return NextResponse.json(
      { ok: false, error: "Worker ID missing" },
      { status: 400 }
    );
  }

  const { rating, comment } = await req.json();

  if (!rating || !comment) {
    return NextResponse.json(
      { ok: false, error: "Rating & comment required" },
      { status: 400 }
    );
  }

  /* ✅ SAVE REVIEW CORRECTLY */
  const review = await Review.create({
    workerUserId,           // 🔥 FIXED
    userId: decoded.userId, // reviewer
    rating,
    comment,
  });

  return NextResponse.json({ ok: true, review });
}
