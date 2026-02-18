import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notify";

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({
    roles: ["user", "worker", "admin"],
  });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 100);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ userId: user.userId, read: false }),
  ]);

  const actorIds = [
    ...new Set(
      notifications
        .map((notification) => notification.actorId?.toString())
        .filter(Boolean)
    ),
  ];

  const actors = await User.find({ _id: { $in: actorIds } })
    .select("name email avatarUrl role")
    .lean();
  const actorMap = new Map(actors.map((actor) => [actor._id.toString(), actor]));

  const rows = notifications.map((notification) => ({
    ...notification,
    actor: notification.actorId ? actorMap.get(notification.actorId.toString()) || null : null,
  }));

  const res = NextResponse.json({
    ok: true,
    notifications: rows,
    unreadCount,
  });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({
    roles: ["user", "worker", "admin"],
  });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const targetUserId = user.role === "admin" && body.userId ? body.userId : user.userId;

  const notification = await createNotification({
    userId: targetUserId,
    actorId: user.userId,
    type: body.type || "system",
    title: body.title || "Notification",
    body: body.body || "",
    href: body.href || "",
    meta: body.meta || {},
  });

  const res = NextResponse.json({ ok: true, notification });
  return applyRefreshCookies(res, refreshedResponse);
}
