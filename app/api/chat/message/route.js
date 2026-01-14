import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });

  const { conversationId, text } = await req.json();

  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json({ ok: false, error: "Invalid conversationId" }, { status: 400 });
  }

  if (!text || !text.trim()) {
    return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });
  }

  const convo = await Conversation.findById(conversationId);
  if (!convo) return NextResponse.json({ ok: false }, { status: 404 });

  const isUser = convo.userId.toString() === decoded.userId;
  const isWorker = convo.workerUserId.toString() === decoded.userId;
  const isAdmin = decoded.role === "admin";

  if (!isUser && !isWorker && !isAdmin) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const msg = await Message.create({
    conversationId,
    senderId: decoded.userId,
    text: text.trim(),
    readBy: [decoded.userId], // ✅ sender already read
  });

  // ✅ update updatedAt so inbox sorts by latest activity
  convo.updatedAt = new Date();
  await convo.save();

  return NextResponse.json({ ok: true, message: msg });
}
