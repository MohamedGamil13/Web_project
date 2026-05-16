import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import * as usersService from "../services/users.service.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMe(req.user.id);
  ok(res, user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await usersService.updateMe(req.user.id, req.body);
  ok(res, user);
});

export const changePassword = asyncHandler(async (req, res) => {
  usersService.assertPasswordReauthToken(
    req.user.id,
    req.headers["x-reauth-token"],
  );
  const result = await usersService.changePassword(req.user.id, req.body);
  ok(res, result);
});

export const verifyPassword = asyncHandler(async (req, res) => {
  const result = await usersService.verifyCurrentPassword(
    req.user.id,
    req.body,
  );
  ok(res, result);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.filename) {
    throw new Error("Avatar upload failed");
  }
  const user = await usersService.setAvatar(req.user.id, req.file.filename);
  ok(res, user);
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await usersService.removeAvatar(req.user.id);
  ok(res, user);
});

export const getAvatar = asyncHandler(async (req, res) => {
  const filePath = await usersService.getAvatarFilePath(req.params.id);
  res.sendFile(filePath);
});

export const listUsersAdmin = asyncHandler(async (req, res) => {
  const result = await usersService.listUsersForAdmin(req.query);
  ok(res, result.items, result.meta);
});

export const updateUserRoleAdmin = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserRoleByAdmin(
    req.user.id,
    req.params.id,
    req.body.role,
  );
  ok(res, user);
});

export const getUserPermissionsOwner = asyncHandler(async (req, res) => {
  const result = await usersService.getUserPermissionsForOwner(req.params.id);
  ok(res, result);
});

export const updateUserPermissionsOwner = asyncHandler(async (req, res) => {
  const result = await usersService.updateUserPermissionsForOwner(
    req.user.id,
    req.params.id,
    req.body,
  );
  ok(res, result);
});
