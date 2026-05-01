import { apiClient, unwrap } from '@/lib/apiClient';

export async function listMyReservations(params) {
  const res = await apiClient.get('/reservations', { params });
  return unwrap(res);
}

export async function createReservation(payload) {
  const res = await apiClient.post('/reservations', payload);
  return unwrap(res);
}

export async function cancelReservation(id) {
  const res = await apiClient.post(`/reservations/${id}/cancel`);
  return unwrap(res);
}
