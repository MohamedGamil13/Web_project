import { apiClient } from "@/lib/apiClient";

export async function listMyNotifications(params) {
  const res = await apiClient.get("/notifications/me", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? { page: 1, pageSize: 10, total: 0 },
  };
}

export async function markNotificationRead(id) {
  const res = await apiClient.patch(`/notifications/${id}/read`);
  return res.data?.data;
}
