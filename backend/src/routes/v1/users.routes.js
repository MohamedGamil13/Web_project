import { Router } from "express";
import {
  getMe,
  updateMe,
  changePassword,
  verifyPassword,
  uploadAvatar as uploadAvatarHandler,
  deleteAvatar,
  getAvatar,
  listUsersAdmin,
  updateUserRoleAdmin,
  getUserPermissionsOwner,
  updateUserPermissionsOwner,
} from "../../controllers/users.controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../auth/permissions.js";
import {
  changePasswordSchema,
  updateMeSchema,
  verifyPasswordSchema,
  objectIdParam,
  listUsersQuerySchema,
  updateUserRoleSchema,
  updateUserPermissionsSchema,
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

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Admin-only list of users
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  requireAuth,
  requirePermission(PERMISSIONS.USERS_VIEW),
  validate(listUsersQuerySchema, "query"),
  listUsersAdmin,
);

/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Admin-only role update (user/admin)
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/role",
  requireAuth,
  requirePermission(PERMISSIONS.USERS_MANAGE_ROLES),
  validate(objectIdParam, "params"),
  validate(updateUserRoleSchema),
  updateUserRoleAdmin,
);

/**
 * @openapi
 * /users/{id}/permissions:
 *   get:
 *     tags: [Users]
 *     summary: Owner-only permissions profile for an admin user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Permission profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/PermissionProfile' }
 */
router.get(
  "/:id/permissions",
  requireAuth,
  requirePermission(PERMISSIONS.USERS_MANAGE_PERMISSIONS),
  validate(objectIdParam, "params"),
  getUserPermissionsOwner,
);

/**
 * @openapi
 * /users/{id}/permissions:
 *   patch:
 *     tags: [Users]
 *     summary: Owner-only update of admin permission overrides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [allow, deny]
 *             properties:
 *               allow:
 *                 type: array
 *                 items: { type: string, example: "analytics.view" }
 *               deny:
 *                 type: array
 *                 items: { type: string, example: "rooms.manage" }
 *     responses:
 *       200:
 *         description: Permission profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/PermissionProfile' }
 */
router.patch(
  "/:id/permissions",
  requireAuth,
  requirePermission(PERMISSIONS.USERS_MANAGE_PERMISSIONS),
  validate(objectIdParam, "params"),
  validate(updateUserPermissionsSchema),
  updateUserPermissionsOwner,
);

export default router;
