import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/response.js";
import * as reservationsService from "../services/reservations.service.js";

export const create = asyncHandler(async (req, res) => {
  const reservation = await reservationsService.createReservation(
    req.user.id,
    req.user.role,
    req.body,
  );
  created(res, reservation);
});

export const listMine = asyncHandler(async (req, res) => {
  const reservations = await reservationsService.listMyReservations(
    req.user.id,
  );
  ok(res, reservations);
});

export const getOne = asyncHandler(async (req, res) => {
  const reservation = await reservationsService.getReservation(
    req.user.id,
    req.user.role,
    req.params.id,
  );
  ok(res, reservation);
});

export const getTimeline = asyncHandler(async (req, res) => {
  const timeline = await reservationsService.getReservationTimeline(
    req.user.id,
    req.user.role,
    req.params.id,
  );
  ok(res, timeline);
});

export const cancel = asyncHandler(async (req, res) => {
  const reservation = await reservationsService.cancelReservation(
    req.user.id,
    req.user.role,
    req.params.id,
  );
  ok(res, reservation);
});

export const listAdmin = asyncHandler(async (req, res) => {
  const result = await reservationsService.listReservationsForAdmin(req.query);
  ok(res, result.items, result.meta);
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const reservation = await reservationsService.updateReservationAsAdmin(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role,
  );
  ok(res, reservation);
});
