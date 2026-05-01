import { Reservation } from "../models/Reservation.js";
import { Room } from "../models/Room.js";
import { Hotel } from "../models/Hotel.js";
import { User } from "../models/User.js";
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
  const [hotel, room, user] = await Promise.all([
    Hotel.findById(r.hotelId).select("name city country reviewAvg").lean(),
    Room.findById(r.roomId).select("roomType pricePerNight capacity").lean(),
    User.findById(r.userId).select("name email").lean(),
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
    user: user
      ? {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        }
      : { id: r.userId },
    hotel: hotel
      ? {
          id: hotel._id.toString(),
          name: hotel.name,
          city: hotel.city,
          country: hotel.country,
          reviewAvg: hotel.reviewAvg ?? 0,
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

async function countOverlappingReservations({
  roomId,
  checkIn,
  checkOut,
  excludeReservationId = null,
}) {
  const filter = {
    roomId,
    status: "active",
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeReservationId) {
    filter._id = { $ne: excludeReservationId };
  }
  return Reservation.countDocuments(filter);
}

export async function createReservation(userId, role, payload) {
  if (role === "admin") {
    throw ApiError.forbidden("Admins cannot create reservations");
  }

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
  const overlapping = await countOverlappingReservations({
    roomId: room._id,
    checkIn,
    checkOut,
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

export async function getReservation(userId, role, id) {
  const reservation = await Reservation.findById(id).lean();
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (role !== "admin" && reservation.userId.toString() !== userId) {
    throw ApiError.forbidden("You can only view your own reservations");
  }
  return shapeReservation(reservation);
}

export async function cancelReservation(userId, role, id) {
  const reservation = await Reservation.findById(id);
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (role !== "admin" && reservation.userId.toString() !== userId) {
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

export async function listReservationsForAdmin(query) {
  const {
    q = "",
    status,
    minRoomPrice,
    maxRoomPrice,
    minHotelRating,
    page = 1,
    pageSize = 10,
  } = query;

  const filters = {};
  if (status) filters.status = status;

  const reservations = await Reservation.find(filters)
    .sort({ createdAt: -1 })
    .lean();
  const shaped = await Promise.all(reservations.map(shapeReservation));

  const needle = q.trim().toLowerCase();
  const filtered = shaped.filter((r) => {
    if (
      typeof minRoomPrice === "number" &&
      (r.room?.pricePerNight ?? 0) < minRoomPrice
    ) {
      return false;
    }
    if (
      typeof maxRoomPrice === "number" &&
      (r.room?.pricePerNight ?? 0) > maxRoomPrice
    ) {
      return false;
    }
    if (
      typeof minHotelRating === "number" &&
      (r.hotel?.reviewAvg ?? 0) < minHotelRating
    ) {
      return false;
    }
    if (!needle) return true;
    const haystack = [
      r.hotel?.name,
      r.hotel?.city,
      r.hotel?.country,
      r.user?.name,
      r.user?.email,
      r.room?.roomType,
      String(r.room?.pricePerNight ?? ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  const skip = (page - 1) * pageSize;
  const items = filtered.slice(skip, skip + pageSize);
  return {
    items,
    meta: { page, pageSize, total: filtered.length },
  };
}

export async function updateReservationAsAdmin(id, patch) {
  const reservation = await Reservation.findById(id);
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (reservation.status === "cancelled") {
    throw ApiError.conflict("Cannot edit a cancelled reservation");
  }

  const room = await Room.findById(reservation.roomId);
  if (!room) throw ApiError.notFound("Room not found");

  const nextCheckIn = patch.checkIn ? new Date(patch.checkIn) : reservation.checkIn;
  const nextCheckOut = patch.checkOut
    ? new Date(patch.checkOut)
    : reservation.checkOut;
  const nextGuests = patch.guests ?? reservation.guests;

  if (nextCheckIn < startOfToday()) {
    throw ApiError.validation("Check-in cannot be in the past", [
      { field: "checkIn", message: "Check-in cannot be in the past" },
    ]);
  }
  if (nextCheckOut <= nextCheckIn) {
    throw ApiError.validation('"checkOut" must be later than "checkIn"', [
      { field: "checkOut", message: '"checkOut" must be later than "checkIn"' },
    ]);
  }
  if (nextGuests > room.capacity) {
    throw ApiError.validation("Too many guests for this room", [
      { field: "guests", message: `This room sleeps up to ${room.capacity}` },
    ]);
  }

  const overlapping = await countOverlappingReservations({
    roomId: room._id,
    checkIn: nextCheckIn,
    checkOut: nextCheckOut,
    excludeReservationId: reservation._id,
  });
  if (overlapping >= room.quantity) {
    throw ApiError.conflict("Room is not available for the selected dates");
  }

  reservation.checkIn = nextCheckIn;
  reservation.checkOut = nextCheckOut;
  reservation.guests = nextGuests;
  reservation.nights = nightsBetween(nextCheckIn, nextCheckOut);
  reservation.totalPrice = reservation.nights * room.pricePerNight;
  await reservation.save();
  return shapeReservation(reservation);
}
