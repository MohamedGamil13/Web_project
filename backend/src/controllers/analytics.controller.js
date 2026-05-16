import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import { getOccupancyInsights } from "../services/analytics.service.js";

export const occupancyInsights = asyncHandler(async (req, res) => {
  const data = await getOccupancyInsights(req.query);
  ok(res, data);
});
