import mongoose from 'mongoose';
import { ok } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  ok(res, {
    status: 'ok',
    uptime: process.uptime(),
    db: dbStateMap[dbState] ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
});
