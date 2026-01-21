import Notification from "@/models/Notification";

export async function createNotification({
  userId,
  actorId = null,
  type,
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
