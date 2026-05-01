import { Reservation } from "../models/Reservation.js";
import { Room } from "../models/Room.js";
import { Hotel } from "../models/Hotel.js";
import { ApiError } from "../utils/ApiError.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function nightsBetween(checkIn, checkOut) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / ONE_DAY_MS);
}

async function shapeReservation(reservationDoc) {
  const r = reservationDoc.toJSON ? reservationDoc.toJSON() : reservationDoc;
  const id = r.id ?? r._id?.toString();
  const [hotel, room] = await Promise.all([
    Hotel.findById(r.hotelId).select("name city country").lean(),
    Room.findById(r.roomId).select("roomType pricePerNight capacity").lean(),
  ]);
  return {
    id,
    userId: r.userId?.toString?.() ?? r.userId,
    status: r.status,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    guests: r.guests,
    nights: r.nights,
    totalPrice: r.totalPrice,
    cancelledAt: r.cancelledAt ?? null,
    createdAt: r.createdAt,
    hotel: hotel
      ? {
          id: hotel._id.toString(),
          name: hotel.name,
          city: hotel.city,
          country: hotel.country,
        }
      : { id: r.hotelId },
    room: room
      ? {
          id: room._id.toString(),
          roomType: room.roomType,
          pricePerNight: room.pricePerNight,
          capacity: room.capacity,
        }
      : { id: r.roomId },
  };
}

export async function createReservation(userId, payload) {
  const checkIn = new Date(payload.checkIn);
  const checkOut = new Date(payload.checkOut);

  if (checkIn < startOfToday()) {
    throw ApiError.validation("Check-in cannot be in the past", [
      { field: "checkIn", message: "Check-in cannot be in the past" },
    ]);
  }

  const room = await Room.findById(payload.roomId);
  if (!room) throw ApiError.notFound("Room not found");

  if (payload.guests > room.capacity) {
    throw ApiError.validation("Too many guests for this room", [
      { field: "guests", message: `This room sleeps up to ${room.capacity}` },
    ]);
  }

  // Block duplicate active reservations by the same user for the same room
  // if the date windows overlap.
  const duplicateMine = await Reservation.findOne({
    userId,
    roomId: room._id,
    status: "active",
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  }).select("_id checkIn checkOut");

  if (duplicateMine) {
    throw ApiError.conflict(
      "You already have an active reservation for this room during the selected dates",
    );
  }

  // Two ranges overlap iff existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn.
  const overlapping = await Reservation.countDocuments({
    roomId: room._id,
    status: "active",
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (overlapping >= room.quantity) {
    throw ApiError.conflict("Room is not available for the selected dates");
  }

  const nights = nightsBetween(checkIn, checkOut);
  const totalPrice = nights * room.pricePerNight;

  const reservation = await Reservation.create({
    userId,
    hotelId: room.hotel,
    roomId: room._id,
    checkIn,
    checkOut,
    guests: payload.guests,
    nights,
    totalPrice,
    status: "active",
  });

  return shapeReservation(reservation);
}

export async function listMyReservations(userId) {
  const reservations = await Reservation.find({ userId })
    .sort({ checkIn: -1 })
    .lean();
  return Promise.all(reservations.map(shapeReservation));
}

export async function getReservation(userId, id) {
  const reservation = await Reservation.findById(id).lean();
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (reservation.userId.toString() !== userId) {
    throw ApiError.forbidden("You can only view your own reservations");
  }
  return shapeReservation(reservation);
}

export async function cancelReservation(userId, id) {
  const reservation = await Reservation.findById(id);
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (reservation.userId.toString() !== userId) {
    throw ApiError.forbidden("You can only cancel your own reservations");
  }
  if (reservation.status === "cancelled") {
    throw ApiError.conflict("Reservation is already cancelled");
  }
  if (reservation.checkIn <= new Date()) {
    throw ApiError.conflict(
      "Cannot cancel a reservation that has already started",
    );
  }

  reservation.status = "cancelled";
  reservation.cancelledAt = new Date();
  await reservation.save();
  return shapeReservation(reservation);
}
