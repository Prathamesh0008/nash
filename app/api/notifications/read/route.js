import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

async function markSingle(req, user) {
  const body = await req.json().catch(() => ({}));
  const id = body.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid notification id" }, { status: 400 });
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, ...(user.role === "admin" ? {} : { userId: user.userId }) },
    { $set: { read: true, readAt: new Date() } },
    { new: true }
  ).lean();

  if (!notification) {
    return NextResponse.json({ ok: false, error: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, notification });
}

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({
    roles: ["user", "worker", "admin"],
  });
  if (errorResponse) return errorResponse;

  const res = await markSingle(req, user);
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  return PATCH(req);
}
