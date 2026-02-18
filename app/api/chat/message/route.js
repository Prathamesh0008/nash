import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import User from "@/models/User";
import { createNotification } from "@/lib/notify";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const conversationId = body.conversationId;
  const text = String(body.text || "").trim();

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json({ ok: false, error: "Invalid conversation id" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ ok: false, error: "Message text is required" }, { status: 400 });
  }

  if (text.length > 2000) {
    return NextResponse.json({ ok: false, error: "Message too long" }, { status: 400 });
  }

  const convo = await Conversation.findById(conversationId);
  if (!convo) return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });

  const canAccess =
    user.role === "admin" ||
    convo.userId?.toString() === user.userId ||
    convo.workerUserId?.toString() === user.userId;

  if (!canAccess) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const message = await Message.create({
    conversationId,
    senderId: user.userId,
    text,
    deliveredTo: [user.userId],
    readBy: [user.userId],
    attachments: Array.isArray(body.attachments) ? body.attachments : [],
  });

  convo.lastMessageAt = new Date();
  await convo.save();

  const recipientId =
    convo.userId?.toString() === user.userId ? convo.workerUserId : convo.userId;
  if (recipientId && recipientId.toString() !== user.userId) {
    const sender = await User.findById(user.userId).select("name email").lean();
    await createNotification({
      userId: recipientId,
      actorId: user.userId,
      type: "message",
      title: `New message from ${sender?.name || sender?.email || "User"}`,
      body: text.length > 100 ? `${text.slice(0, 100)}...` : text,
      href: `/chat/${conversationId}`,
      meta: { conversationId: conversationId.toString(), messageId: message._id.toString() },
    });
  }

  const res = NextResponse.json({ ok: true, message });
  return applyRefreshCookies(res, refreshedResponse);
}
