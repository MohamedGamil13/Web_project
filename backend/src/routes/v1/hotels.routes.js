import { Router } from "express";
import {
  listHotels,
  getHotel,
  listHotelRooms,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../../controllers/hotels.controller.js";
import {
  listForHotel as listReviewsForHotel,
  getMineForHotel as getMyReviewForHotel,
  createForHotel as createReviewForHotel,
} from "../../controllers/reviews.controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  listHotelsQuerySchema,
  objectIdParam,
  createHotelSchema,
  updateHotelSchema,
} from "../../validators/hotels.validators.js";
import {
  createReviewSchema,
  listReviewsQuerySchema,
} from "../../validators/reviews.validators.js";

const router = Router();

/**
 * @openapi
 * /hotels:
 *   get:
 *     tags: [Hotels]
 *     summary: List hotels with filters and pagination
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search text for hotel name/city/country.
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: minStars
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *       - in: query
 *         name: amenities
 *         schema: { type: string, example: wifi,pool }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price, -price, -rating, name, -name, -createdAt] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 50 }
 *     responses:
 *       200:
 *         description: Hotel list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/HotelSummary' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     pageSize: { type: integer, example: 10 }
 *                     total: { type: integer, example: 48 }
 */
router.get("/", validate(listHotelsQuerySchema, "query"), listHotels);

/**
 * @openapi
 * /hotels/{id}:
 *   get:
 *     tags: [Hotels]
 *     summary: Get a hotel with its rooms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Hotel details
 *       404:
 *         description: Hotel not found
 */
router.get("/:id", validate(objectIdParam, "params"), getHotel);

/**
 * @openapi
 * /hotels/{id}/rooms:
 *   get:
 *     tags: [Hotels]
 *     summary: List rooms belonging to a hotel
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rooms list
 */
router.get("/:id/rooms", validate(objectIdParam, "params"), listHotelRooms);

/**
 * @openapi
 * /hotels/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for a hotel
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a hotel
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id/reviews",
  validate(objectIdParam, "params"),
  validate(listReviewsQuerySchema, "query"),
  listReviewsForHotel,
);
router.post(
  "/:id/reviews",
  requireAuth,
  validate(objectIdParam, "params"),
  validate(createReviewSchema),
  createReviewForHotel,
);

/**
 * @openapi
 * /hotels/{id}/reviews/me:
 *   get:
 *     tags: [Reviews]
 *     summary: Get the authenticated user's review for this hotel (or null)
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id/reviews/me",
  requireAuth,
  validate(objectIdParam, "params"),
  getMyReviewForHotel,
);

// Admin-only mutations (also useful for dev seeding via an admin token).
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(createHotelSchema),
  createHotel,
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(objectIdParam, "params"),
  validate(updateHotelSchema),
  updateHotel,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(objectIdParam, "params"),
  deleteHotel,
);

export default router;
