import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function DELETE(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { messageId } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return NextResponse.json({ ok: false, error: "Invalid message id" }, { status: 400 });
  }

  const message = await Message.findById(messageId);
  if (!message) return NextResponse.json({ ok: false, error: "Message not found" }, { status: 404 });

  if (user.role !== "admin" && message.senderId?.toString() !== user.userId) {
    return NextResponse.json({ ok: false, error: "Only sender can delete message" }, { status: 403 });
  }

  const conversation = await Conversation.findById(message.conversationId).lean();
  if (!conversation) {
    return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
  }

  const canAccess =
    user.role === "admin" ||
    conversation.userId?.toString() === user.userId ||
    conversation.workerUserId?.toString() === user.userId;

  if (!canAccess) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  message.deleted = true;
  message.deletedAt = new Date();
  await message.save();

  const res = NextResponse.json({ ok: true, messageId });
  return applyRefreshCookies(res, refreshedResponse);
}