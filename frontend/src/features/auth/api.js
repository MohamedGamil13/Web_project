import { apiClient, unwrap } from '@/lib/apiClient';

export async function register(payload) {
  const res = await apiClient.post('/auth/register', payload);
  return unwrap(res);
}

export async function login(payload) {
  const res = await apiClient.post('/auth/login', payload);
  return unwrap(res);
}

export async function getMe() {
  const res = await apiClient.get('/auth/me');
  return unwrap(res);
}

export async function updateProfile(patch) {
  const res = await apiClient.patch('/users/me', patch);
  return unwrap(res);
}

export async function logoutServer() {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Stateless logout — ignore failures.
  }
}
