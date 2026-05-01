import { apiClient, unwrap } from '@/lib/apiClient';

export async function listMyReservations() {
  const res = await apiClient.get('/reservations/me');
  return unwrap(res) ?? [];
}

export async function getReservation(id) {
  const res = await apiClient.get(`/reservations/${id}`);
  return unwrap(res);
}

export async function createReservation(payload) {
  const res = await apiClient.post('/reservations', payload);
  return unwrap(res);
}

export async function cancelReservation(id) {
  const res = await apiClient.patch(`/reservations/${id}/cancel`);
  return unwrap(res);
}
