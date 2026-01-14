import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function DELETE(req, context) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { messageId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid messageId" },
      { status: 400 }
    );
  }

  // ✅ fetch message FIRST
  const msg = await Message.findById(messageId);

  if (!msg) {
    return NextResponse.json(
      { ok: false, error: "Message not found" },
      { status: 404 }
    );
  }

  // ✅ only sender can delete
  if (msg.senderId.toString() !== decoded.userId) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  // ✅ ensure user belongs to conversation
  const convo = await Conversation.findById(msg.conversationId).lean();
  if (!convo) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const isUser = convo.userId.toString() === decoded.userId;
  const isWorker = convo.workerUserId.toString() === decoded.userId;
  const isAdmin = decoded.role === "admin";

  if (!isUser && !isWorker && !isAdmin) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  // 🔥 ACTUAL DELETE (THIS MUST RUN)
  msg.deleted = true;
  msg.deletedAt = new Date();

  await msg.save(); // 🔥 THIS IS THE CRITICAL LINE
  console.log("🔥 DELETE API HIT 🔥");
  console.log("🟢 SAVED MESSAGE:", {
  id: msg._id.toString(),
  deleted: msg.deleted,
  deletedAt: msg.deletedAt,
  db: msg.collection.name,
});


  return NextResponse.json({ ok: true, messageId });
}
