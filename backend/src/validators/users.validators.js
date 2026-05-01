import Joi from 'joi';

export const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().lowercase().email(),
  phone: Joi.string().trim().max(40).allow('', null),
  avatarUrl: Joi.string().trim().uri().allow('', null),
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });
