import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  await dbConnect();

  // 🔐 AUTH
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  if (decoded.role !== "worker") {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  // 📦 FULL BODY (FLEXIBLE)
  const body = await req.json();

  // 🧠 MINIMUM REQUIRED (ONLY THESE)
  if (!body.fullName || !body.phone || !body.city) {
    return NextResponse.json(
      { ok: false, error: "Required fields missing" },
      { status: 400 }
    );
  }

  // 🔄 Keep User name in sync
  await User.findByIdAndUpdate(decoded.userId, {
    name: body.fullName,
  });

  // 💾 SAVE / UPDATE WORKER PROFILE (UPSERT)
  const profile = await WorkerProfile.findOneAndUpdate(
    { userId: decoded.userId },
    {
      ...body,                 // 🔥 ALL FIELDS SAVED
      userId: decoded.userId,
      status: "pending",       // 🔒 admin approval required
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, profile });
}
