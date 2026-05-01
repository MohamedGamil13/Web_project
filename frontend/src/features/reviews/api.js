import { apiClient, unwrap } from '@/lib/apiClient';

export async function listHotelReviews(hotelId, params) {
  const res = await apiClient.get(`/hotels/${hotelId}/reviews`, { params });
  return { items: unwrap(res), meta: res.data?.meta };
}

export async function createReview(hotelId, payload) {
  const res = await apiClient.post(`/hotels/${hotelId}/reviews`, payload);
  return unwrap(res);
}

export async function updateReview(reviewId, payload) {
  const res = await apiClient.patch(`/reviews/${reviewId}`, payload);
  return unwrap(res);
}

export async function deleteReview(reviewId) {
  const res = await apiClient.delete(`/reviews/${reviewId}`);
  return unwrap(res);
}
