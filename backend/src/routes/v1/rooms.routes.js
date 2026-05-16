import { Router } from "express";
import {
  getRoom,
  updateRoom,
  deleteRoom,
} from "../../controllers/hotels.controller.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../auth/permissions.js";
import { validate } from "../../middleware/validate.js";
import {
  objectIdParam,
  updateRoomSchema,
} from "../../validators/hotels.validators.js";

const router = Router();

router.get("/:id", validate(objectIdParam, "params"), getRoom);
router.patch(
  "/:id",
  requireAuth,
  requirePermission(PERMISSIONS.ROOMS_MANAGE),
  validate(objectIdParam, "params"),
  validate(updateRoomSchema),
  updateRoom,
);
router.delete(
  "/:id",
  requireAuth,
  requirePermission(PERMISSIONS.ROOMS_MANAGE),
  validate(objectIdParam, "params"),
  deleteRoom,
);

export default router;
