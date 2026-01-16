import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });
  if (decoded.role !== "worker") return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json();

  // minimal required
  if (!body.fullName || !body.phone || !body.city) {
    return NextResponse.json({ ok: false, error: "Full name, phone, city required" }, { status: 400 });
  }

  await User.findByIdAndUpdate(decoded.userId, { name: body.fullName });

  const profile = await WorkerProfile.findOneAndUpdate(
    { userId: decoded.userId },
    {
      ...body,
      userId: decoded.userId,
      status: "pending",
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, profile });
}
