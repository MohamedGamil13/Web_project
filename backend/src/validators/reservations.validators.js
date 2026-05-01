import Joi from "joi";

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Invalid id",
  });

export const createReservationSchema = Joi.object({
  roomId: objectId.required(),
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required().messages({
    "date.greater": '"checkOut" must be later than "checkIn"',
  }),
  guests: Joi.number().integer().min(1).max(16).required(),
});

export const reservationIdParam = Joi.object({
  id: objectId.required(),
});
