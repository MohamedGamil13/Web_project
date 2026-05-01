import { apiClient } from '@/lib/apiClient';

export async function listHotels(params) {
  const res = await apiClient.get('/hotels', { params });
  return { items: res.data?.data ?? [], meta: res.data?.meta ?? { page: 1, pageSize: 10, total: 0 } };
}

export async function getHotel(id) {
  const res = await apiClient.get(`/hotels/${id}`);
  return res.data?.data;
}

export async function listHotelRooms(id) {
  const res = await apiClient.get(`/hotels/${id}/rooms`);
  return res.data?.data ?? [];
}
