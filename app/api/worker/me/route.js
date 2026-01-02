import dbConnect from "@/lib/db";
import WorkerProfile from "@/models/WorkerProfile";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const decoded = verifyToken(token);

  const profile = await WorkerProfile.findOne({ userId: decoded.userId });

  return NextResponse.json({ ok: true, profile });
}
