import Joi from "joi";

export const occupancyInsightsQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(90).default(14),
  warningThreshold: Joi.number().min(0).max(1).default(0.7),
  criticalThreshold: Joi.number().min(0).max(1).default(0.85),
});
