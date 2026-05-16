import { apiClient, unwrap } from "@/lib/apiClient";

export async function listMyReservations() {
  const res = await apiClient.get("/reservations/me");
  return unwrap(res) ?? [];
}

export async function getReservation(id) {
  const res = await apiClient.get(`/reservations/${id}`);
  return unwrap(res);
}

export async function getReservationTimeline(id) {
  const res = await apiClient.get(`/reservations/${id}/timeline`);
  return unwrap(res) ?? [];
}

export async function createReservation(payload) {
  const res = await apiClient.post("/reservations", payload);
  return unwrap(res);
}

export async function cancelReservation(id) {
  const res = await apiClient.patch(`/reservations/${id}/cancel`);
  return unwrap(res);
}

export async function listAdminReservations(params) {
  const res = await apiClient.get("/reservations/manage", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? { page: 1, pageSize: 10, total: 0 },
  };
}

export async function updateReservationAsAdmin(id, payload) {
  const res = await apiClient.patch(`/reservations/${id}`, payload);
  return unwrap(res);
}
