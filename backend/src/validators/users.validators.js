import Joi from 'joi';

// Accept either an http(s) URL or a base64-encoded data URL for an image.
// Cap at ~3 MB to leave headroom over the 5 MB body limit.
const avatarUrlRule = Joi.alternatives()
  .try(
    Joi.string().trim().valid(''),
    Joi.string().trim().uri({ scheme: ['http', 'https'] }),
    Joi.string()
      .trim()
      .max(3 * 1024 * 1024)
      .pattern(/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/, {
        name: 'data-image-base64',
      })
  )
  .allow('', null);

export const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().lowercase().email(),
  phone: Joi.string().trim().max(40).allow('', null),
  avatarUrl: avatarUrlRule,
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });
