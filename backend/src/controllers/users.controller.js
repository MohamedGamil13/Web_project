import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import * as usersService from '../services/users.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMe(req.user.id);
  ok(res, user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await usersService.updateMe(req.user.id, req.body);
  ok(res, user);
});
