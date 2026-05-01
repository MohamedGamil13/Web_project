import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details;

  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = `Invalid value for ${err.path}`;
  } else if (err?.code === 11000) {
    status = 409;
    code = 'CONFLICT';
    message = 'Duplicate value';
    details = Object.keys(err.keyValue ?? {}).map((field) => ({ field, message: 'already exists' }));
  } else if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    status = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid or expired token';
  } else if (err?.isJoi) {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.details?.map((d) => ({ field: d.path?.join('.'), message: d.message }));
  } else if (err?.status && err?.message) {
    status = err.status;
    message = err.message;
  }

  if (status >= 500) {
    console.error(err);
  }

  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  if (!isProd && err?.stack) body.error.stack = err.stack;

  res.status(status).json(body);
}
