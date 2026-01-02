import dbConnect from "@/lib/db";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const decoded = verifyToken(token);
  const admin = await User.findById(decoded.userId);

  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const workers = await WorkerProfile.find()
    .populate("userId", "email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, workers });
}
