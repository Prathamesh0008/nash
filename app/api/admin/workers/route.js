import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();

  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });
  if (decoded.role !== "admin") return NextResponse.json({ ok: false }, { status: 403 });

  const profiles = await WorkerProfile.find({}).lean();
  const users = await User.find({ role: "worker" }).lean();
  const map = {};
  users.forEach((u) => (map[u._id.toString()] = u));

  const result = profiles.map((p) => ({
    workerUserId: p.userId,
    name: map[p.userId.toString()]?.name || "",
    email: map[p.userId.toString()]?.email || "",
    city: p.city,
    services: p.services,
    status: p.status,
  }));

  return NextResponse.json({ ok: true, workers: result });
}
