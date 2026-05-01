import { apiClient, unwrap } from '@/lib/apiClient';

export async function login(payload) {
  const res = await apiClient.post('/auth/login', payload);
  return unwrap(res);
}

export async function register(payload) {
  const res = await apiClient.post('/auth/register', payload);
  return unwrap(res);
}

export async function getMe() {
  const res = await apiClient.get('/users/me');
  return unwrap(res);
}
