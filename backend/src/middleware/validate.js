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
    // Express 5 exposes req.query as a getter that re-parses on every access,
    // so an in-place mutation would be lost on the next read. Replace the
    // accessor with a plain value so coerced numbers, booleans, etc. survive.
    if (where === 'query') {
      Object.defineProperty(req, 'query', {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else if (where === 'params') {
      const target = req.params;
      Object.keys(target).forEach((k) => delete target[k]);
      Object.assign(target, value);
    } else {
      req[where] = value;
    }
    next();
  };
}
