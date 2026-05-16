import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../auth/permissions.js";
import { validate } from "../../middleware/validate.js";
import { occupancyInsights } from "../../controllers/analytics.controller.js";
import { occupancyInsightsQuerySchema } from "../../validators/analytics.validators.js";

const router = Router();

router.use(requireAuth, requirePermission(PERMISSIONS.ANALYTICS_VIEW));

/**
 * @openapi
 * /analytics/occupancy-insights:
 *   get:
 *     tags: [Analytics]
 *     summary: Occupancy utilization, threshold alerts, and sell-out forecast
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, minimum: 1, maximum: 90, default: 14 }
 *       - in: query
 *         name: warningThreshold
 *         schema: { type: number, minimum: 0, maximum: 1, default: 0.7 }
 *       - in: query
 *         name: criticalThreshold
 *         schema: { type: number, minimum: 0, maximum: 1, default: 0.85 }
 *     responses:
 *       200:
 *         description: Occupancy insights
 */
router.get(
  "/occupancy-insights",
  validate(occupancyInsightsQuerySchema, "query"),
  occupancyInsights,
);

export default router;
