import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  await dbConnect();

  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { workerUserId } = await req.json();
  if (!workerUserId) return NextResponse.json({ ok: false, error: "Missing workerUserId" }, { status: 400 });

  // Only allow starting chat with ACTIVE worker
  const wp = await WorkerProfile.findOne({ userId: workerUserId, status: "active" }).lean();
  if (!wp) return NextResponse.json({ ok: false, error: "Worker not available" }, { status: 400 });

  // user <-> worker only
  let userId = decoded.userId;
  let workerId = workerUserId;

  // If worker tries to open conversation, still keep correct fields
  if (decoded.role === "worker") {
    userId = workerUserId; // not typical, but keep simple: workers should not "start" chats
    return NextResponse.json({ ok: false, error: "Workers cannot start chats" }, { status: 403 });
  }

  const convo = await Conversation.findOneAndUpdate(
    { userId, workerUserId: workerId },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ ok: true, conversationId: convo._id });
}
