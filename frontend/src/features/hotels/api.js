import { apiClient } from "@/lib/apiClient";

export async function listHotels(params) {
  const res = await apiClient.get("/hotels", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? { page: 1, pageSize: 10, total: 0 },
  };
}

export async function getHotel(id) {
  const res = await apiClient.get(`/hotels/${id}`);
  return res.data?.data;
}

export async function listHotelRooms(id) {
  const res = await apiClient.get(`/hotels/${id}/rooms`);
  return res.data?.data ?? [];
}

export async function createHotel(payload) {
  const res = await apiClient.post("/hotels", payload);
  return res.data?.data;
}

export async function updateHotel(id, payload) {
  const res = await apiClient.patch(`/hotels/${id}`, payload);
  return res.data?.data;
}

export async function deleteHotel(id) {
  const res = await apiClient.delete(`/hotels/${id}`);
  return res.data?.data;
}

export async function createRoom(hotelId, payload) {
  const res = await apiClient.post(`/hotels/${hotelId}/rooms`, payload);
  return res.data?.data;
}

export async function getRoom(id) {
  const res = await apiClient.get(`/rooms/${id}`);
  return res.data?.data;
}

export async function updateRoom(id, payload) {
  const res = await apiClient.patch(`/rooms/${id}`, payload);
  return res.data?.data;
}

export async function deleteRoom(id) {
  const res = await apiClient.delete(`/rooms/${id}`);
  return res.data?.data;
}
