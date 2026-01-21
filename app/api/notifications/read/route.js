import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();

  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await req.json();

  await Notification.updateOne(
    { _id: id, userId: decoded.userId },
    { read: true, readAt: new Date() }
  );

  return NextResponse.json({ ok: true });
}
