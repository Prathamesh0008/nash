import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();

  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });
  if (decoded.role !== "admin") return NextResponse.json({ ok: false }, { status: 403 });

  const convos = await Conversation.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, conversations: convos });
}
