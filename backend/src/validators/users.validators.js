import Joi from "joi";
import { ALL_PERMISSIONS } from "../auth/permissions.js";

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

export const listUsersQuerySchema = Joi.object({
  q: Joi.string().trim().max(120).allow(""),
  role: Joi.string().valid("owner", "user", "admin"),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid("user", "admin").required(),
});

export const updateUserPermissionsSchema = Joi.object({
  allow: Joi.array()
    .items(Joi.string().valid(...ALL_PERMISSIONS))
    .default([]),
  deny: Joi.array()
    .items(Joi.string().valid(...ALL_PERMISSIONS))
    .default([]),
})
  .custom((value, helpers) => {
    const allow = new Set(value.allow ?? []);
    const deny = new Set(value.deny ?? []);
    for (const permission of allow) {
      if (deny.has(permission)) {
        return helpers.message(
          `Permission "${permission}" cannot exist in both allow and deny`,
        );
      }
    }
    return value;
  })
  .required();
