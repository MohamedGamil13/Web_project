import { Hotel } from "../models/Hotel.js";
import { Room } from "../models/Room.js";
import { ApiError } from "../utils/ApiError.js";

const SORT_MAP = {
  price: { priceFrom: 1, _id: 1 },
  "-price": { priceFrom: -1, _id: 1 },
  "-rating": { reviewAvg: -1, _id: 1 },
  name: { name: 1, _id: 1 },
  "-name": { name: -1, _id: 1 },
  "-createdAt": { createdAt: -1, _id: 1 },
};

function summarize(hotelDoc) {
  const h = hotelDoc.toJSON ? hotelDoc.toJSON() : hotelDoc;
  return {
    id: h.id ?? h._id?.toString(),
    name: h.name,
    city: h.city,
    country: h.country,
    starRating: h.starRating,
    amenities: h.amenities ?? [],
    priceFrom: h.priceFrom ?? 0,
    reviewAvg: h.reviewAvg ?? 0,
    reviewCount: h.reviewCount ?? 0,
    thumbnail: h.images?.[0] ?? null,
  };
}

export async function listHotels(query) {
  const {
    q,
    city,
    minPrice,
    maxPrice,
    minStars,
    amenities,
    sort,
    page = 1,
    pageSize = 10,
  } = query;

  const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRx(q), "i");
    filter.$or = [{ name: rx }, { city: rx }, { country: rx }];
  }
  if (city) filter.city = new RegExp(escapeRx(city), "i");
  if (typeof minStars === "number") filter.starRating = { $gte: minStars };
  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    filter.priceFrom = {};
    if (typeof minPrice === "number") filter.priceFrom.$gte = minPrice;
    if (typeof maxPrice === "number") filter.priceFrom.$lte = maxPrice;
  }
  if (Array.isArray(amenities) && amenities.length > 0) {
    filter.amenities = { $all: amenities };
  }

  const sortBy = SORT_MAP[sort] ?? { _id: 1 };
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    Hotel.find(filter).sort(sortBy).skip(skip).limit(pageSize).lean(),
    Hotel.countDocuments(filter),
  ]);

  return {
    items: items.map(summarize),
    meta: { page, pageSize, total },
  };
}

export async function getHotelDetail(id) {
  const hotel = await Hotel.findById(id);
  if (!hotel) throw ApiError.notFound("Hotel not found");
  const rooms = await Room.find({ hotel: hotel._id })
    .sort({ pricePerNight: 1 })
    .lean();

  const summary = summarize(hotel);
  return {
    ...summary,
    description: hotel.description ?? "",
    address: hotel.address ?? "",
    images: hotel.images ?? [],
    rooms: rooms.map((r) => ({
      id: r._id.toString(),
      hotel: r.hotel.toString(),
      roomType: r.roomType,
      capacity: r.capacity,
      pricePerNight: r.pricePerNight,
      quantity: r.quantity,
      amenities: r.amenities ?? [],
      images: r.images ?? [],
    })),
  };
}

export async function createHotel(payload) {
  const hotel = await Hotel.create(payload);
  return hotel.toJSON();
}

export async function updateHotel(id, patch) {
  const hotel = await Hotel.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
    context: "query",
  });
  if (!hotel) throw ApiError.notFound("Hotel not found");
  return hotel.toJSON();
}

export async function deleteHotel(id) {
  const hotel = await Hotel.findByIdAndDelete(id);
  if (!hotel) throw ApiError.notFound("Hotel not found");
  await Room.deleteMany({ hotel: hotel._id });
  return { id };
}

export async function listRoomsForHotel(hotelId) {
  const hotel = await Hotel.findById(hotelId).select("_id").lean();
  if (!hotel) throw ApiError.notFound("Hotel not found");
  const rooms = await Room.find({ hotel: hotelId })
    .sort({ pricePerNight: 1 })
    .lean();
  return rooms.map((r) => ({
    id: r._id.toString(),
    hotel: r.hotel.toString(),
    roomType: r.roomType,
    capacity: r.capacity,
    pricePerNight: r.pricePerNight,
    quantity: r.quantity,
    amenities: r.amenities ?? [],
    images: r.images ?? [],
  }));
}
