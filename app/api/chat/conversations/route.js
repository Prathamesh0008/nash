import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);

  const filter =
    user.role === "worker"
      ? { workerUserId: user.userId }
      : user.role === "user"
        ? { userId: user.userId }
        : {};

  const convos = await Conversation.find(filter).sort({ updatedAt: -1 }).limit(limit).lean();
  if (convos.length === 0) {
    const empty = NextResponse.json({ ok: true, conversations: [] });
    return applyRefreshCookies(empty, refreshedResponse);
  }

  const convoIds = convos.map((c) => c._id);
  const otherIds = [
    ...new Set(
      convos
        .map((c) => {
          if (user.role === "worker") return c.userId?.toString();
          if (user.role === "user") return c.workerUserId?.toString();
          return c.userId?.toString();
        })
        .filter(Boolean)
    ),
  ];

  const [people, latestByConvo, unreadByConvo] = await Promise.all([
    User.find({ _id: { $in: otherIds } }).select("name email").lean(),
    Message.aggregate([
      { $match: { conversationId: { $in: convoIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          text: { $first: "$text" },
          createdAt: { $first: "$createdAt" },
          deleted: { $first: "$deleted" },
          senderId: { $first: "$senderId" },
          deliveredTo: { $first: "$deliveredTo" },
          readBy: { $first: "$readBy" },
        },
      },
    ]),
    Message.aggregate([
      {
        $match: {
          conversationId: { $in: convoIds },
          senderId: { $ne: new mongoose.Types.ObjectId(user.userId) },
          readBy: { $ne: new mongoose.Types.ObjectId(user.userId) },
          deleted: { $ne: true },
        },
      },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]),
  ]);

  const peopleMap = new Map(people.map((p) => [p._id.toString(), p]));
  const latestMap = new Map(latestByConvo.map((row) => [row._id.toString(), row]));
  const unreadMap = new Map(unreadByConvo.map((row) => [row._id.toString(), row.count]));

  const rows = convos.map((convo) => {
    const otherId =
      user.role === "worker"
        ? convo.userId?.toString()
        : user.role === "user"
          ? convo.workerUserId?.toString()
          : convo.userId?.toString();

    const other = peopleMap.get(otherId);
    const latest = latestMap.get(convo._id.toString());
    const counterpartId =
      user.role === "worker"
        ? convo.userId?.toString()
        : user.role === "user"
          ? convo.workerUserId?.toString()
          : null;

    let lastMessageStatus = "";
    if (latest?.senderId?.toString() === user.userId && counterpartId) {
      const delivered = (latest.deliveredTo || []).some((id) => id.toString() === counterpartId);
      const read = (latest.readBy || []).some((id) => id.toString() === counterpartId);
      lastMessageStatus = read ? "read" : delivered ? "delivered" : "sent";
    }

    return {
      id: convo._id,
      bookingId: convo.bookingId,
      name: other?.name || other?.email || "Unknown",
      lastMessage: latest?.deleted ? "(deleted)" : latest?.text || "",
      lastMessageAt: latest?.createdAt || convo.lastMessageAt || convo.updatedAt,
      unreadCount: unreadMap.get(convo._id.toString()) || 0,
      lastMessageStatus,
    };
  });

  const res = NextResponse.json({ ok: true, conversations: rows });
  return applyRefreshCookies(res, refreshedResponse);
}
