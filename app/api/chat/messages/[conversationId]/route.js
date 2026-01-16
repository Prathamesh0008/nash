import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import mongoose from "mongoose";

export async function GET(req, context) {
  await dbConnect();

  // ✅ cookies() async (Next 15)
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // ✅ params async (Next 15)
  const { conversationId } = await context.params;

  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "Missing conversationId" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json({ ok: false, error: "Invalid conversationId" }, { status: 400 });
  }

  const convo = await Conversation.findById(conversationId).lean();
  if (!convo) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  // ✅ Authorization (user/worker/admin)
  const isUser = convo.userId.toString() === decoded.userId;
  const isWorker = convo.workerUserId.toString() === decoded.userId;
  const isAdmin = decoded.role === "admin";

  if (!isUser && !isWorker && !isAdmin) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  // ✅ Mark messages as read for viewer (only messages not sent by them)
  await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: decoded.userId },
      readBy: { $ne: decoded.userId },
    },
    { $addToSet: { readBy: decoded.userId } }
  );

 const messages = await Message.find({
  conversationId,
  deleted: { $ne: true },
})
  .sort({ createdAt: 1 })
  .lean();


  // ✅ Hide deleted message text
  const safe = messages.map((m) => ({
    ...m,
    text: m.deleted ? "(deleted)" : m.text,
  }));

  return NextResponse.json({ ok: true, messages: safe });
}
