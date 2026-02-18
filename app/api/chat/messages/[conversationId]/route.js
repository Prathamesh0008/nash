import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const { conversationId } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json({ ok: false, error: "Invalid conversation id" }, { status: 400 });
  }

  const convo = await Conversation.findById(conversationId).lean();
  if (!convo) return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });

  const canAccess =
    user.role === "admin" ||
    convo.userId?.toString() === user.userId ||
    convo.workerUserId?.toString() === user.userId;

  if (!canAccess) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const toMark = await Message.find({
    conversationId,
    senderId: { $ne: user.userId },
    deleted: { $ne: true },
    $or: [{ readBy: { $ne: user.userId } }, { deliveredTo: { $ne: user.userId } }],
  })
    .select("_id readBy deliveredTo")
    .lean();

  const deliveredIds = toMark
    .filter((message) => !(message.deliveredTo || []).some((id) => id.toString() === user.userId))
    .map((message) => message._id.toString());

  const readIds = toMark
    .filter((message) => !(message.readBy || []).some((id) => id.toString() === user.userId))
    .map((message) => message._id.toString());

  if (toMark.length > 0) {
    await Message.updateMany(
      { _id: { $in: toMark.map((msg) => msg._id) } },
      { $addToSet: { deliveredTo: user.userId, readBy: user.userId } }
    );
  }

  const messages = await Message.find({ conversationId, deleted: { $ne: true } }).sort({ createdAt: 1 }).lean();

  const res = NextResponse.json({
    ok: true,
    conversation: convo,
    messages,
    statusUpdates: { deliveredIds, readIds },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
