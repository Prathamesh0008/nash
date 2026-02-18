import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const convos = await Conversation.find({}).sort({ updatedAt: -1 }).limit(200).lean();
  const ids = convos.map((c) => c._id);
  const userIds = [...new Set(convos.flatMap((c) => [c.userId?.toString(), c.workerUserId?.toString()]).filter(Boolean))];

  const [users, lastMessages] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("name email role").lean(),
    Message.aggregate([
      { $match: { conversationId: { $in: ids } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$conversationId", text: { $first: "$text" }, createdAt: { $first: "$createdAt" } } },
    ]),
  ]);

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const msgMap = new Map(lastMessages.map((m) => [m._id.toString(), m]));

  const rows = convos.map((c) => ({
    ...c,
    customer: userMap.get(c.userId?.toString()) || null,
    worker: userMap.get(c.workerUserId?.toString()) || null,
    lastMessage: msgMap.get(c._id.toString()) || null,
  }));

  const res = NextResponse.json({ ok: true, chats: rows });
  return applyRefreshCookies(res, refreshedResponse);
}