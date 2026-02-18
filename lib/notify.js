import Notification from "@/models/Notification";
import User from "@/models/User";

export async function createNotification({
  userId,
  actorId = null,
  type = "system",
  title,
  body = "",
  href = "",
  meta = {},
}) {
  const n = await Notification.create({
    userId,
    actorId,
    type,
    title,
    body,
    href,
    meta,
  });

  return n.toObject();
}

export async function createNotificationsBulk(items = []) {
  const safeItems = items
    .filter((item) => item?.userId && item?.title)
    .map((item) => ({
      userId: item.userId,
      actorId: item.actorId || null,
      type: item.type || "system",
      title: item.title,
      body: item.body || "",
      href: item.href || "",
      meta: item.meta || {},
    }));

  if (safeItems.length === 0) return [];
  return Notification.insertMany(safeItems, { ordered: false });
}

export async function notifyAdmins({
  actorId = null,
  type = "system",
  title,
  body = "",
  href = "",
  meta = {},
}) {
  const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
  if (admins.length === 0) return [];

  return createNotificationsBulk(
    admins.map((admin) => ({
      userId: admin._id,
      actorId,
      type,
      title,
      body,
      href,
      meta,
    }))
  );
}
