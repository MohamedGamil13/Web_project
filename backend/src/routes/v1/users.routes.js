import { Router } from 'express';
import { getMe, updateMe } from '../../controllers/users.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { updateMeSchema } from '../../validators/users.validators.js';

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', requireAuth, getMe);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 */
router.patch('/me', requireAuth, validate(updateMeSchema), updateMe);

export default router;
