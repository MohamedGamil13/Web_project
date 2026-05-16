import jwt from "jsonwebtoken";
import { env, isTest } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { resolvePermissions } from "../auth/permissions.js";
import { User } from "../models/User.js";

export async function requireAuth(req, _res, next) {
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
    if (isTest) {
      req.user = {
        id: payload.sub,
        role: payload.role,
        permissions: resolvePermissions(payload.role),
      };
      next();
      return;
    }

    const user = await User.findById(payload.sub)
      .select("role permissionOverrides")
      .lean();
    if (!user) {
      return next(ApiError.unauthorized("Invalid or expired token"));
    }
    req.user = {
      id: payload.sub,
      role: user.role,
      permissions: resolvePermissions(user.role, user.permissionOverrides),
    };
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

export function requirePermission(...permissions) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Unauthorized"));
    }
    const granted = new Set(req.user.permissions ?? []);
    const allowed = permissions.every((p) => granted.has(p));
    if (!allowed) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
