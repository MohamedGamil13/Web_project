import { apiClient, unwrap } from '@/lib/apiClient';

export async function listHotels(params) {
  const res = await apiClient.get('/hotels', { params });
  return { items: unwrap(res), meta: res.data?.meta };
}

export async function getHotel(id) {
  const res = await apiClient.get(`/hotels/${id}`);
  return unwrap(res);
}
