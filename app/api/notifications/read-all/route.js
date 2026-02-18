import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function PATCH() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({
    roles: ["user", "worker", "admin"],
  });
  if (errorResponse) return errorResponse;

  const result = await Notification.updateMany(
    { userId: user.userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  const res = NextResponse.json({ ok: true, markedCount: result.modifiedCount || 0 });
  return applyRefreshCookies(res, refreshedResponse);
}
