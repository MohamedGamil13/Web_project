import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/response.js";
import * as hotelsService from "../services/hotels.service.js";

export const listHotels = asyncHandler(async (req, res) => {
  const result = await hotelsService.listHotels(req.query);
  ok(res, result.items, result.meta);
});

export const getHotel = asyncHandler(async (req, res) => {
  const hotel = await hotelsService.getHotelDetail(req.params.id);
  ok(res, hotel);
});

export const listHotelRooms = asyncHandler(async (req, res) => {
  const rooms = await hotelsService.listRoomsForHotel(req.params.id);
  ok(res, rooms);
});

export const createHotel = asyncHandler(async (req, res) => {
  const hotel = await hotelsService.createHotel(req.body);
  created(res, hotel);
});

export const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await hotelsService.updateHotel(req.params.id, req.body);
  ok(res, hotel);
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const result = await hotelsService.deleteHotel(req.params.id);
  ok(res, result);
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await hotelsService.getRoomById(req.params.id);
  ok(res, room);
});

export const createRoom = asyncHandler(async (req, res) => {
  const room = await hotelsService.createRoomForHotel(req.params.id, req.body);
  created(res, room);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await hotelsService.updateRoom(req.params.id, req.body);
  ok(res, room);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const result = await hotelsService.deleteRoom(req.params.id);
  ok(res, result);
});
