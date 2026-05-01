import { Router } from "express";
import { getHealth } from "../../controllers/health.controller.js";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Liveness/readiness probe
 *     responses:
 *       200:
 *         description: Service is up
 */
router.get("/", getHealth);

export default router;
