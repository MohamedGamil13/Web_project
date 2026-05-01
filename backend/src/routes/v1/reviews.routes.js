import { Router } from "express";
import { updateOwn, deleteOwn } from "../../controllers/reviews.controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  reviewIdParam,
  updateReviewSchema,
} from "../../validators/reviews.validators.js";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update one of your own reviews
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id",
  validate(reviewIdParam, "params"),
  validate(updateReviewSchema),
  updateOwn,
);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete one of your own reviews
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", validate(reviewIdParam, "params"), deleteOwn);

export default router;
