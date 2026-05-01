import { Router } from 'express';
import {
  create,
  listMine,
  getOne,
  cancel,
} from '../../controllers/reservations.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  createReservationSchema,
  reservationIdParam,
} from '../../validators/reservations.validators.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create a new reservation
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validate(createReservationSchema), create);

/**
 * @openapi
 * /reservations/me:
 *   get:
 *     tags: [Reservations]
 *     summary: List the authenticated user's reservations
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', listMine);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get a reservation owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', validate(reservationIdParam, 'params'), getOne);

/**
 * @openapi
 * /reservations/{id}/cancel:
 *   patch:
 *     tags: [Reservations]
 *     summary: Cancel a reservation
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/cancel', validate(reservationIdParam, 'params'), cancel);

export default router;
