import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { Hotel } from "../models/Hotel.js";
import { ApiError } from "../utils/ApiError.js";

const SORT_MAP = {
  "-createdAt": { createdAt: -1 },
  createdAt: { createdAt: 1 },
  "-rating": { rating: -1, createdAt: -1 },
  rating: { rating: 1, createdAt: -1 },
};

function shape(reviewDoc) {
  const r = reviewDoc.toJSON ? reviewDoc.toJSON() : reviewDoc;
  const id = r.id ?? r._id?.toString();
  // Author may be a populated user document or a raw ObjectId.
  const rawUser = r.user;
  const user =
    rawUser && typeof rawUser === "object" && rawUser.name
      ? {
          id: (rawUser._id ?? rawUser.id)?.toString?.() ?? rawUser.id,
          name: rawUser.name,
          avatarUrl: rawUser.avatarUrl ?? null,
        }
      : { id: rawUser?.toString?.() ?? rawUser };
  return {
    id,
    hotelId: r.hotel?.toString?.() ?? r.hotel,
    rating: r.rating,
    comment: r.comment ?? "",
    user,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

async function recomputeHotelStats(hotelId) {
  const result = await Review.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = result[0] ?? {};
  await Hotel.findByIdAndUpdate(hotelId, {
    reviewAvg: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

export async function listForHotel(hotelId, query) {
  const hotel = await Hotel.findById(hotelId).select("_id").lean();
  if (!hotel) throw ApiError.notFound("Hotel not found");

  const { page = 1, pageSize = 10, sort = "-createdAt" } = query;
  const sortBy = SORT_MAP[sort];
  const skip = (page - 1) * pageSize;

  const [docs, total] = await Promise.all([
    Review.find({ hotel: hotelId })
      .sort(sortBy)
      .skip(skip)
      .limit(pageSize)
      .populate("user", "name avatarUrl")
      .lean(),
    Review.countDocuments({ hotel: hotelId }),
  ]);

  return { items: docs.map(shape), meta: { page, pageSize, total } };
}

export async function getMineForHotel(userId, hotelId) {
  const review = await Review.findOne({ user: userId, hotel: hotelId })
    .populate("user", "name avatarUrl")
    .lean();
  if (!review) return null;
  return shape(review);
}

export async function createForHotel(userId, hotelId, payload) {
  const hotel = await Hotel.findById(hotelId).select("_id").lean();
  if (!hotel) throw ApiError.notFound("Hotel not found");

  const existing = await Review.findOne({ user: userId, hotel: hotelId })
    .select("_id")
    .lean();
  if (existing) {
    throw ApiError.conflict(
      "You have already reviewed this hotel — update your existing review instead",
    );
  }

  let review;
  try {
    review = await Review.create({
      user: userId,
      hotel: hotelId,
      rating: payload.rating,
      comment: payload.comment ?? "",
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw ApiError.conflict("You have already reviewed this hotel");
    }
    throw err;
  }

  await recomputeHotelStats(hotelId);
  await review.populate("user", "name avatarUrl");
  return shape(review);
}

export async function updateOwn(userId, reviewId, payload) {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound("Review not found");
  if (review.user.toString() !== userId) {
    throw ApiError.forbidden("You can only edit your own reviews");
  }
  if (payload.rating !== undefined) review.rating = payload.rating;
  if (payload.comment !== undefined) review.comment = payload.comment;
  await review.save();
  await recomputeHotelStats(review.hotel);
  await review.populate("user", "name avatarUrl");
  return shape(review);
}

export async function deleteOwn(userId, reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound("Review not found");
  if (review.user.toString() !== userId) {
    throw ApiError.forbidden("You can only delete your own reviews");
  }
  const hotelId = review.hotel;
  await review.deleteOne();
  await recomputeHotelStats(hotelId);
  return { id: reviewId };
}
