import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Booking from "@/models/Booking";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const bookingId = body.bookingId;
  const workerUserId = body.workerUserId;

  let userId = body.userId || null;
  let workerId = workerUserId || null;

  if (bookingId) {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ ok: false, error: "Invalid bookingId" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId).lean();
    if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });

    const allowed =
      user.role === "admin" ||
      booking.userId?.toString() === user.userId ||
      booking.workerId?.toString() === user.userId;
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Forbidden for this booking" }, { status: 403 });
    }

    userId = booking.userId?.toString();
    workerId = booking.workerId?.toString();
  }

  if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  if (!userId) {
    if (user.role !== "user") {
      return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });
    }
    userId = user.userId;
  }

  if (user.role === "user" && userId !== user.userId) {
    return NextResponse.json({ ok: false, error: "Cannot create conversation for another user" }, { status: 403 });
  }

  const worker = await WorkerProfile.findOne({ userId: workerId }).lean();
  if (!worker) return NextResponse.json({ ok: false, error: "Worker not found" }, { status: 404 });

  const convo = await Conversation.findOneAndUpdate(
    {
      bookingId: bookingId || null,
      userId,
      workerUserId: workerId,
    },
    {
      $setOnInsert: {
        bookingId: bookingId || null,
        userId,
        workerUserId: workerId,
      },
      $set: { lastMessageAt: new Date() },
    },
    { upsert: true, new: true }
  );

  if (bookingId) {
    await Booking.updateOne({ _id: bookingId }, { $set: { conversationId: convo._id } });
  }

  const res = NextResponse.json({ ok: true, conversationId: convo._id, conversation: convo });
  return applyRefreshCookies(res, refreshedResponse);
}