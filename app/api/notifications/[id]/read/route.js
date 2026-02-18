import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({
    roles: ["user", "worker", "admin"],
  });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid notification id" }, { status: 400 });
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: id,
      ...(user.role === "admin" ? {} : { userId: user.userId }),
    },
    { $set: { read: true, readAt: new Date() } },
    { new: true }
  ).lean();

  if (!notification) {
    return NextResponse.json({ ok: false, error: "Notification not found" }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true, notification });
  return applyRefreshCookies(res, refreshedResponse);
}
