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

export const updateReservationSchema = Joi.object({
  checkIn: Joi.date().iso(),
  checkOut: Joi.date().iso(),
  guests: Joi.number().integer().min(1).max(16),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.checkIn && value.checkOut) {
      const inDate = new Date(value.checkIn);
      const outDate = new Date(value.checkOut);
      if (outDate <= inDate) {
        return helpers.error("date.order");
      }
    }
    return value;
  })
  .messages({
    "date.order": '"checkOut" must be later than "checkIn"',
  });

export const listAdminReservationsQuerySchema = Joi.object({
  status: Joi.string().valid("active", "cancelled"),
  minRoomPrice: Joi.number().min(0),
  maxRoomPrice: Joi.number()
    .min(0)
    .when("minRoomPrice", {
      is: Joi.number().exist(),
      then: Joi.number().min(Joi.ref("minRoomPrice")),
    }),
  minHotelRating: Joi.number().min(0).max(5),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});
