import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded || decoded.role !== "worker") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const updates = await req.json();

  const profile = await WorkerProfile.findOneAndUpdate(
    { userId: decoded.userId },
    {
      ...updates,
      status: "pending",
      updatedAt: new Date(),
    },
    { new: true }
  );

  return NextResponse.json({ ok: true, profile });
}
