import dbConnect from "@/lib/db";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();
  const token = cookies().get("token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.userId).select("-passwordHash");
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let workerProfile = null;
  if (user.role === "worker") {
    workerProfile = await WorkerProfile.findOne({ userId: user._id });
  }

  return NextResponse.json({ ok: true, user, workerProfile });
}

export async function PUT(req) {
  await dbConnect();
  const token = cookies().get("token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const decoded = verifyToken(token);
  const body = await req.json();

  const user = await User.findByIdAndUpdate(
    decoded.userId,
    { fullName: body.fullName || "" },
    { new: true }
  ).select("-passwordHash");

  return NextResponse.json({ ok: true, user });
}
