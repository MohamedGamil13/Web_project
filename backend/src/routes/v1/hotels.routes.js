import { Router } from 'express';
import {
  listHotels,
  getHotel,
  listHotelRooms,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../../controllers/hotels.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import {
  listHotelsQuerySchema,
  objectIdParam,
  createHotelSchema,
  updateHotelSchema,
} from '../../validators/hotels.validators.js';

const router = Router();

/**
 * @openapi
 * /hotels:
 *   get:
 *     tags: [Hotels]
 *     summary: List hotels with filters and pagination
 */
router.get('/', validate(listHotelsQuerySchema, 'query'), listHotels);

/**
 * @openapi
 * /hotels/{id}:
 *   get:
 *     tags: [Hotels]
 *     summary: Get a hotel with its rooms
 */
router.get('/:id', validate(objectIdParam, 'params'), getHotel);

/**
 * @openapi
 * /hotels/{id}/rooms:
 *   get:
 *     tags: [Hotels]
 *     summary: List rooms belonging to a hotel
 */
router.get('/:id/rooms', validate(objectIdParam, 'params'), listHotelRooms);

// Admin-only mutations (also useful for dev seeding via an admin token).
router.post('/', requireAuth, requireRole('admin'), validate(createHotelSchema), createHotel);
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate(objectIdParam, 'params'),
  validate(updateHotelSchema),
  updateHotel
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate(objectIdParam, 'params'),
  deleteHotel
);

export default router;
