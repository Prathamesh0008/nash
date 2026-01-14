import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });

  let convos = [];

  if (decoded.role === "worker") {
    convos = await Conversation.find({ workerUserId: decoded.userId }).sort({ updatedAt: -1 }).lean();
  } else if (decoded.role === "user") {
    convos = await Conversation.find({ userId: decoded.userId }).sort({ updatedAt: -1 }).lean();
  } else if (decoded.role === "admin") {
    convos = await Conversation.find({}).sort({ updatedAt: -1 }).lean();
  }

  if (!convos.length) return NextResponse.json({ ok: true, conversations: [] });

  // "Other person" depends on role
  const otherIds = convos.map((c) => {
    if (decoded.role === "worker") return c.userId;
    if (decoded.role === "user") return c.workerUserId;
    return c.userId;
  });

  const people = await User.find({ _id: { $in: otherIds } }).lean();
  const peopleMap = {};
  people.forEach((u) => (peopleMap[u._id.toString()] = u));

  const results = await Promise.all(
    convos.map(async (c) => {
      const otherId =
        decoded.role === "worker" ? c.userId :
        decoded.role === "user" ? c.workerUserId :
        c.userId;

      const other = peopleMap[otherId?.toString()];

      const last = await Message.findOne({ conversationId: c._id }).sort({ createdAt: -1 }).lean();

      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        senderId: { $ne: decoded.userId },
        readBy: { $ne: decoded.userId },
        deleted: { $ne: true },
      });

      return {
        id: c._id,
        name: other?.name?.trim() || other?.email || "Unknown",
        lastMessage: last ? (last.deleted ? "(deleted)" : last.text) : "",
        lastMessageAt: last?.createdAt || null,
        unreadCount,
      };
    })
  );

  return NextResponse.json({ ok: true, conversations: results });
}
