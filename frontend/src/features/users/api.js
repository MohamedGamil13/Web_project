import { apiClient } from "@/lib/apiClient";

export async function listUsers(params) {
  const res = await apiClient.get("/users", { params });
  return {
    items: res.data?.data ?? [],
    meta: res.data?.meta ?? { page: 1, pageSize: 10, total: 0 },
  };
}

export async function updateUserRole(id, role) {
  const res = await apiClient.patch(`/users/${id}/role`, { role });
  return res.data?.data;
}

export async function getUserPermissions(id) {
  const res = await apiClient.get(`/users/${id}/permissions`);
  return res.data?.data;
}

export async function updateUserPermissions(id, payload) {
  const res = await apiClient.patch(`/users/${id}/permissions`, payload);
  return res.data?.data;
}
