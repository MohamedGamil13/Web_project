import { Router } from "express";
import {
  getMe,
  updateMe,
  changePassword,
  verifyPassword,
  uploadAvatar as uploadAvatarHandler,
  deleteAvatar,
  getAvatar,
} from "../../controllers/users.controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  changePasswordSchema,
  updateMeSchema,
  verifyPasswordSchema,
  objectIdParam,
} from "../../validators/users.validators.js";
import { uploadAvatar } from "../../middleware/uploadAvatar.js";

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/User' }
 */
router.get("/me", requireAuth, getMe);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Alice Updated }
 *               phone: { type: string, example: "+201055555555" }
 */
router.patch("/me", requireAuth, validate(updateMeSchema), updateMe);

/**
 * @openapi
 * /users/me/password/verify:
 *   post:
 *     tags: [Users]
 *     summary: Verify current password and receive a short-lived re-auth token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword]
 *             properties:
 *               currentPassword: { type: string, example: Password1 }
 */
router.post(
  "/me/password/verify",
  requireAuth,
  validate(verifyPasswordSchema),
  verifyPassword,
);

/**
 * @openapi
 * /users/me/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change the authenticated user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword: { type: string, example: NewPassword1 }
 *     parameters:
 *       - in: header
 *         name: x-reauth-token
 *         required: true
 *         schema: { type: string }
 *         description: Token returned by `POST /users/me/password/verify` (valid for 10 minutes)
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     ok: { type: boolean, example: true }
 *       401:
 *         description: Current password is incorrect or token missing
 *       422:
 *         description: Invalid request payload
 */
router.patch(
  "/me/password",
  requireAuth,
  validate(changePasswordSchema),
  changePassword,
);

/**
 * @openapi
 * /users/me/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload or replace profile avatar image
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Users]
 *     summary: Remove profile avatar image
 *     security:
 *       - bearerAuth: []
 *
 * /users/{id}/avatar:
 *   get:
 *     tags: [Users]
 *     summary: Serve a user's avatar image (auth required)
 *     security:
 *       - bearerAuth: []
 */
router.post("/me/avatar", requireAuth, uploadAvatar, uploadAvatarHandler);
router.delete("/me/avatar", requireAuth, deleteAvatar);
router.get(
  "/:id/avatar",
  requireAuth,
  validate(objectIdParam, "params"),
  getAvatar,
);

export default router;
