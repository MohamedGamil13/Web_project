import Joi from "joi";

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Invalid id",
  });

export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow("").max(1000),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().allow("").max(1000),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

export const reviewIdParam = Joi.object({
  id: objectId.required(),
});

export const listReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string()
    .valid("-createdAt", "createdAt", "-rating", "rating")
    .default("-createdAt"),
});
