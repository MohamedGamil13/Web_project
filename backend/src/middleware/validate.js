import { ApiError } from '../utils/ApiError.js';

export function validate(schema, where = 'body') {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req[where], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
      return next(ApiError.validation('Invalid request', details));
    }
    req[where] = value;
    next();
  };
}
