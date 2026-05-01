import Joi from "joi";

export const objectIdParam = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ "string.pattern.base": "Invalid id" }),
});

export const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().lowercase().email(),
  phone: Joi.string().trim().max(40).allow("", null),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

const passwordRule = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Za-z]/, "letter")
  .pattern(/[0-9]/, "number")
  .messages({
    "string.min": "Password must be at least 8 characters",
    "string.pattern.name": "Password must contain a {#name}",
  });

export const changePasswordSchema = Joi.object({
  newPassword: passwordRule.required(),
});

export const verifyPasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).required(),
});
