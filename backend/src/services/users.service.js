import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import path from "node:path";
import fs from "node:fs/promises";
import jwt from "jsonwebtoken";
import { AVATAR_DIR } from "../middleware/uploadAvatar.js";

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user.toJSON();
}

export async function updateMe(userId, patch) {
  if (patch.email) {
    const clash = await User.findOne({
      email: patch.email,
      _id: { $ne: userId },
    }).lean();
    if (clash) throw ApiError.conflict("Email is already in use");
  }

  const set = { ...patch };
  const unset = {};
  for (const k of ["phone"]) {
    if (set[k] === "" || set[k] === null) {
      delete set[k];
      unset[k] = 1;
    }
  }

  const update = {};
  if (Object.keys(set).length > 0) update.$set = set;
  if (Object.keys(unset).length > 0) update.$unset = unset;

  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
    context: "query",
  });
  if (!user) throw ApiError.notFound("User not found");
  return user.toJSON();
}

export async function changePassword(userId, { newPassword }) {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  user.passwordHash = await bcrypt.hash(newPassword, env.bcryptRounds);
  await user.save();

  return { ok: true };
}

export async function verifyCurrentPassword(userId, { currentPassword }) {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.unauthorized("Current password is incorrect");
  const reauthToken = jwt.sign(
    { sub: user.id, type: "password_reauth" },
    env.jwtSecret,
    {
      expiresIn: "10m",
    },
  );
  return { reauthToken, expiresIn: "10m" };
}

export function assertPasswordReauthToken(userId, token) {
  if (!token)
    throw ApiError.unauthorized("Password re-authentication required");
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (_err) {
    throw ApiError.unauthorized("Password re-authentication required");
  }
  if (payload?.type !== "password_reauth" || payload?.sub !== userId) {
    throw ApiError.unauthorized("Password re-authentication required");
  }
}

function safeAvatarPathFromStored(stored) {
  const base = path.basename(stored);
  return path.resolve(AVATAR_DIR, base);
}

export async function setAvatar(userId, filename) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  if (user.avatarPath) {
    const previous = safeAvatarPathFromStored(user.avatarPath);
    await fs.unlink(previous).catch(() => {});
  }

  user.avatarPath = filename;
  await user.save();
  return user.toJSON();
}

export async function removeAvatar(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  if (user.avatarPath) {
    const filePath = safeAvatarPathFromStored(user.avatarPath);
    await fs.unlink(filePath).catch(() => {});
  }
  user.avatarPath = undefined;
  await user.save();
  return user.toJSON();
}

export async function getAvatarFilePath(userId) {
  const user = await User.findById(userId).select("avatarPath");
  if (!user || !user.avatarPath) throw ApiError.notFound("Avatar not found");
  const filePath = safeAvatarPathFromStored(user.avatarPath);
  await fs.access(filePath).catch(() => {
    throw ApiError.notFound("Avatar not found");
  });
  return filePath;
}
