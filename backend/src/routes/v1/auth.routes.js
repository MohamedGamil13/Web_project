import { Router } from 'express';
import { register, login, me, logout } from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from '../../validators/auth.validators.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new account
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate and receive a JWT
 */
router.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', requireAuth, me);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Stateless logout (client clears its token)
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', requireAuth, logout);

export default router;
