import { apiClient, unwrap } from "@/lib/apiClient";

export async function register(payload) {
  const res = await apiClient.post("/auth/register", payload);
  return unwrap(res);
}

export async function login(payload) {
  const res = await apiClient.post("/auth/login", payload);
  return unwrap(res);
}

export async function getMe() {
  const res = await apiClient.get("/auth/me");
  return unwrap(res);
}

export async function updateProfile(patch) {
  const res = await apiClient.patch("/users/me", patch);
  return unwrap(res);
}

export async function changePassword(payload) {
  const res = await apiClient.patch("/users/me/password", payload.body, {
    headers: { "x-reauth-token": payload.reauthToken },
  });
  return unwrap(res);
}

export async function verifyPassword(currentPassword) {
  const res = await apiClient.post("/users/me/password/verify", {
    currentPassword,
  });
  return unwrap(res);
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  const res = await apiClient.post("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res);
}

export async function removeAvatar() {
  const res = await apiClient.delete("/users/me/avatar");
  return unwrap(res);
}

export async function logoutServer() {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Stateless logout — ignore failures.
  }
}
