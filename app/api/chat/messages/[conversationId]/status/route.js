import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

function normalizeMessageIds(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((id) => mongoose.Types.ObjectId.isValid(id));
}

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({
    roles: ["user", "worker", "admin"],
  });
  if (errorResponse) return errorResponse;

  const { conversationId } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json({ ok: false, error: "Invalid conversation id" }, { status: 400 });
  }

  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) {
    return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
  }

  const canAccess =
    user.role === "admin" ||
    conversation.userId?.toString() === user.userId ||
    conversation.workerUserId?.toString() === user.userId;
  if (!canAccess) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const markDelivered = Boolean(body.delivered);
  const markRead = Boolean(body.read);
  const messageIds = normalizeMessageIds(body.messageIds);

  if (!markDelivered && !markRead) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }

  const filter = {
    conversationId,
    senderId: { $ne: user.userId },
    deleted: { $ne: true },
  };

  if (messageIds.length > 0) {
    filter._id = { $in: messageIds };
  }

  const baseMatch = await Message.find(filter).select("_id deliveredTo readBy").lean();
  if (baseMatch.length === 0) {
    const res = NextResponse.json({ ok: true, deliveredIds: [], readIds: [] });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const deliveredIds = markDelivered
    ? baseMatch
        .filter((msg) => !(msg.deliveredTo || []).some((id) => id.toString() === user.userId))
        .map((msg) => msg._id.toString())
    : [];

  const readIds = markRead
    ? baseMatch
        .filter((msg) => !(msg.readBy || []).some((id) => id.toString() === user.userId))
        .map((msg) => msg._id.toString())
    : [];

  if (deliveredIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: deliveredIds } },
      { $addToSet: { deliveredTo: user.userId } }
    );
  }

  if (readIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: readIds } },
      {
        $addToSet: {
          readBy: user.userId,
          deliveredTo: user.userId,
        },
      }
    );
  }

  const res = NextResponse.json({ ok: true, deliveredIds, readIds });
  return applyRefreshCookies(res, refreshedResponse);
}
