import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  listMine,
  markRead,
} from "../../controllers/notifications.controller.js";
import {
  listNotificationsQuerySchema,
  notificationIdParam,
} from "../../validators/notifications.validators.js";

const router = Router();

router.use(requireAuth);
/**
 * @openapi
 * /notifications/me:
 *   get:
 *     tags: [Notifications]
 *     summary: List current user's notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *     responses:
 *       200:
 *         description: Notifications list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Notification' }
 */
router.get("/me", validate(listNotificationsQuerySchema, "query"), listMine);
/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch("/:id/read", validate(notificationIdParam, "params"), markRead);

export default router;
