import { Room } from "../models/Room.js";
import { Hotel } from "../models/Hotel.js";
import { Reservation } from "../models/Reservation.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  return new Date(d.getTime() + n * ONE_DAY_MS);
}

function overlapNights(aStart, aEnd, bStart, bEnd) {
  const start = Math.max(aStart.getTime(), bStart.getTime());
  const end = Math.min(aEnd.getTime(), bEnd.getTime());
  if (end <= start) return 0;
  return Math.round((end - start) / ONE_DAY_MS);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export async function getOccupancyInsights({
  days,
  warningThreshold,
  criticalThreshold,
}) {
  const today = startOfDay();
  const windowEnd = addDays(today, days);
  const last14 = addDays(today, -14);

  const rooms = await Room.find({}).lean();
  const hotelIds = [...new Set(rooms.map((r) => String(r.hotel)))];
  const hotels = await Hotel.find({ _id: { $in: hotelIds } })
    .select("name city country")
    .lean();
  const hotelsById = new Map(hotels.map((h) => [String(h._id), h]));

  const roomIds = rooms.map((r) => r._id);
  const [activeReservations, recentReservations] = await Promise.all([
    Reservation.find({
      roomId: { $in: roomIds },
      status: "active",
      checkIn: { $lt: windowEnd },
      checkOut: { $gt: today },
    })
      .select("roomId checkIn checkOut")
      .lean(),
    Reservation.find({
      roomId: { $in: roomIds },
      status: "active",
      createdAt: { $gte: last14 },
    })
      .select("roomId nights")
      .lean(),
  ]);

  const byRoomOverlaps = new Map();
  for (const r of activeReservations) {
    const key = String(r.roomId);
    const nights = overlapNights(today, windowEnd, new Date(r.checkIn), new Date(r.checkOut));
    byRoomOverlaps.set(key, (byRoomOverlaps.get(key) ?? 0) + nights);
  }

  const byRoomRecentNights = new Map();
  for (const r of recentReservations) {
    const key = String(r.roomId);
    byRoomRecentNights.set(key, (byRoomRecentNights.get(key) ?? 0) + Number(r.nights ?? 0));
  }

  const items = rooms.map((room) => {
    const roomId = String(room._id);
    const hotel = hotelsById.get(String(room.hotel));
    const capacityNights = room.quantity * days;
    const bookedNights = byRoomOverlaps.get(roomId) ?? 0;
    const remainingNights = Math.max(0, capacityNights - bookedNights);
    const utilization = capacityNights ? round2(bookedNights / capacityNights) : 0;

    const recentNights = byRoomRecentNights.get(roomId) ?? 0;
    const dailyBookingRate = round2(recentNights / 14);
    const daysToFull =
      dailyBookingRate > 0 ? round2(remainingNights / dailyBookingRate) : null;

    let thresholdLevel = "normal";
    if (utilization >= criticalThreshold) thresholdLevel = "critical";
    else if (utilization >= warningThreshold) thresholdLevel = "warning";

    let forecastLevel = "normal";
    if (daysToFull !== null && daysToFull <= 7) forecastLevel = "critical";
    else if (daysToFull !== null && daysToFull <= 14) forecastLevel = "warning";

    return {
      roomId,
      roomType: room.roomType,
      quantity: room.quantity,
      hotel: hotel
        ? {
            id: String(hotel._id),
            name: hotel.name,
            city: hotel.city,
            country: hotel.country,
          }
        : null,
      windowDays: days,
      capacityNights,
      bookedNights,
      remainingNights,
      utilization,
      thresholdLevel,
      forecast: {
        recentNights14d: recentNights,
        dailyBookingRate,
        daysToFull,
        level: forecastLevel,
      },
    };
  });

  const alerts = items
    .filter((i) => i.thresholdLevel !== "normal" || i.forecast.level !== "normal")
    .map((i) => ({
      roomId: i.roomId,
      hotelName: i.hotel?.name ?? "Unknown hotel",
      roomType: i.roomType,
      utilization: i.utilization,
      thresholdLevel: i.thresholdLevel,
      forecastLevel: i.forecast.level,
      daysToFull: i.forecast.daysToFull,
    }));

  const totals = items.reduce(
    (acc, i) => {
      acc.capacityNights += i.capacityNights;
      acc.bookedNights += i.bookedNights;
      return acc;
    },
    { capacityNights: 0, bookedNights: 0 },
  );

  const overallUtilization =
    totals.capacityNights > 0
      ? round2(totals.bookedNights / totals.capacityNights)
      : 0;

  return {
    summary: {
      windowStart: today.toISOString(),
      windowEnd: windowEnd.toISOString(),
      windowDays: days,
      warningThreshold,
      criticalThreshold,
      totalRooms: items.length,
      capacityNights: totals.capacityNights,
      bookedNights: totals.bookedNights,
      overallUtilization,
      alertCount: alerts.length,
    },
    alerts,
    items,
  };
}
