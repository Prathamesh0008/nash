import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded || decoded.role !== "worker") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const reviews = await Review.find({
    workerUserId: decoded.userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, reviews });
}
