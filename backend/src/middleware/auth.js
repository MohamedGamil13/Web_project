import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  let token = null;
  if (header) {
    const [scheme, bearer] = header.split(" ");
    if (scheme === "Bearer" && bearer) token = bearer;
  }
  if (!token && typeof req.query?.token === "string" && req.query.token) {
    token = req.query.token;
  }
  if (!token)
    return next(
      ApiError.unauthorized("Missing or malformed Authorization header"),
    );
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
