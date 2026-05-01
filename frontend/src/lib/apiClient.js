import axios from 'axios';
import { env } from './env';

export const TOKEN_STORAGE_KEY = 'hb.token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage unavailable — ignore
  }
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
    }
    const apiError = error.response?.data?.error ?? {
      code: 'NETWORK_ERROR',
      message: error.message ?? 'Network error',
    };
    return Promise.reject(apiError);
  }
);

export function unwrap(response) {
  return response.data?.data;
}
