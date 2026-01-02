import dbConnect from "@/lib/db";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function POST(req) {
  await dbConnect();

  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const decoded = verifyToken(token);
  const admin = await User.findById(decoded.userId);

  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { workerId, action, reason } = await req.json();

  if (!workerId || !action) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let update = {};

  if (action === "approve") {
    update = {
      status: "active",
      rejectionReason: "",
    };
  }

  if (action === "reject") {
    update = {
      status: "rejected",
      rejectionReason: reason || "Profile not approved",
    };
  }

  await WorkerProfile.findByIdAndUpdate(workerId, update);

  return NextResponse.json({ ok: true });
}
