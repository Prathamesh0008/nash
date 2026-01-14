import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();
  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });
  if (decoded.role !== "worker") return NextResponse.json({ ok: false }, { status: 403 });

  const profile = await WorkerProfile.findOne({ userId: decoded.userId }).lean();
  return NextResponse.json({ ok: true, profile });
}
