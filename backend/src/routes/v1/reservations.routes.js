import { Router } from "express";
import {
  create,
  listMine,
  getOne,
  cancel,
} from "../../controllers/reservations.controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  createReservationSchema,
  reservationIdParam,
} from "../../validators/reservations.validators.js";

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roomId, checkIn, checkOut, guests]
 *             properties:
 *               roomId: { type: string, example: 68138c10f50f803fba179630, description: "Hotel id is derived from the room — don't send it." }
 *               checkIn: { type: string, format: date, example: 2026-06-01 }
 *               checkOut: { type: string, format: date, example: 2026-06-04 }
 *               guests: { type: integer, minimum: 1, example: 2 }
 *     responses:
 *       201:
 *         description: Reservation created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Reservation' }
 *       409:
 *         description: Conflict (room unavailable or user already has an overlapping active reservation for this room)
 */
router.post("/", validate(createReservationSchema), create);

/**
 * @openapi
 * /reservations/me:
 *   get:
 *     tags: [Reservations]
 *     summary: List the authenticated user's reservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservations list
 */
router.get("/me", listMine);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get a reservation owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get("/:id", validate(reservationIdParam, "params"), getOne);

/**
 * @openapi
 * /reservations/{id}/cancel:
 *   patch:
 *     tags: [Reservations]
 *     summary: Cancel a reservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reservation cancelled
 */
router.patch("/:id/cancel", validate(reservationIdParam, "params"), cancel);

export default router;
