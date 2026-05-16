import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import * as notificationsService from "../services/notifications.service.js";

export const listMine = asyncHandler(async (req, res) => {
  const result = await notificationsService.listMyNotifications(
    req.user.id,
    req.query,
  );
  ok(res, result.items, result.meta);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markAsRead(
    req.user.id,
    req.params.id,
  );
  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }
  ok(res, notification);
});
