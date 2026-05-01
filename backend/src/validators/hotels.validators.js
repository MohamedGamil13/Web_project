import Joi from "joi";

const csvToArray = (v) =>
  String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const listHotelsQuerySchema = Joi.object({
  q: Joi.string().trim().max(120).allow(""),
  city: Joi.string().trim().max(80).allow(""),
  minPrice: Joi.number().min(0),
  // Only enforce maxPrice ≥ minPrice when minPrice is actually provided —
  // dropping the cross-field constraint when the sibling is missing avoids
  // a Joi.ref() resolving to undefined ("limit is not a valid number").
  maxPrice: Joi.number()
    .min(0)
    .when("minPrice", {
      is: Joi.number().exist(),
      then: Joi.number().min(Joi.ref("minPrice")),
    }),
  minStars: Joi.number().integer().min(1).max(5),
  amenities: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().lowercase()),
    Joi.string().custom((v) => csvToArray(v).map((s) => s.toLowerCase())),
  ),
  sort: Joi.string().valid(
    "price",
    "-price",
    "-rating",
    "name",
    "-name",
    "-createdAt",
  ),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});

export const objectIdParam = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ "string.pattern.base": "Invalid id" }),
});

export const createHotelSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().allow(""),
  city: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
  address: Joi.string().allow(""),
  starRating: Joi.number().integer().min(1).max(5).required(),
  amenities: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
  priceFrom: Joi.number().min(0).default(0),
});

export const updateHotelSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().allow(""),
  city: Joi.string().trim(),
  country: Joi.string().trim(),
  address: Joi.string().allow(""),
  starRating: Joi.number().integer().min(1).max(5),
  amenities: Joi.array().items(Joi.string().trim().lowercase()),
  images: Joi.array().items(Joi.string().uri()),
  priceFrom: Joi.number().min(0),
}).min(1);
