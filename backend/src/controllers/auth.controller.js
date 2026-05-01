import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  created(res, result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  ok(res, result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  ok(res, user);
});

export const logout = asyncHandler(async (_req, res) => {
  // Stateless JWT — client clears the token.
  ok(res, { ok: true });
});
