import { Notification } from "../models/Notification.js";

export async function notifyReservationEvent({
  userId,
  type,
  title,
  message,
  reservationId,
}) {
  await Notification.create({
    userId,
    type,
    title,
    message,
    payload: { reservationId },
  });
}

export async function listMyNotifications(userId, { page = 1, pageSize = 10 }) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Notification.countDocuments({ userId }),
  ]);
  return { items: items.map((n) => n.toJSON()), meta: { page, pageSize, total } };
}

export async function markAsRead(userId, id) {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
  return notification ? notification.toJSON() : null;
}
