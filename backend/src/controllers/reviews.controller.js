import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/response.js";
import * as reviewsService from "../services/reviews.service.js";

export const listForHotel = asyncHandler(async (req, res) => {
  const result = await reviewsService.listForHotel(req.params.id, req.query);
  ok(res, result.items, result.meta);
});

export const getMineForHotel = asyncHandler(async (req, res) => {
  const review = await reviewsService.getMineForHotel(
    req.user.id,
    req.params.id,
  );
  ok(res, review);
});

export const createForHotel = asyncHandler(async (req, res) => {
  const review = await reviewsService.createForHotel(
    req.user.id,
    req.params.id,
    req.body,
  );
  created(res, review);
});

export const updateOwn = asyncHandler(async (req, res) => {
  const review = await reviewsService.updateOwn(
    req.user.id,
    req.params.id,
    req.body,
  );
  ok(res, review);
});

export const deleteOwn = asyncHandler(async (req, res) => {
  const result = await reviewsService.deleteOwn(req.user.id, req.params.id);
  ok(res, result);
});
