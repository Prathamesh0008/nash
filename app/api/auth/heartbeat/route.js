import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST() {
  await dbConnect();

  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });

  await User.updateOne(
    { _id: decoded.userId },
    { $set: { lastSeenAt: new Date() } }
  );

  return NextResponse.json({ ok: true });
}
