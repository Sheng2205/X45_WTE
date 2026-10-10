import axios from 'axios';
import { tokenStore } from '../../modules/auth/store/token.store';

/**
 * Resolves the backend API base URL:
 * 1. Reads VITE_API_URL or VITE_API_BASE_URL if configured.
 * 2. If neither is provided:
 *    - In production (import.meta.env.PROD): defaults to Render backend ('https://x45-wte-be.onrender.com/api').
 *    - In development (import.meta.env.DEV): defaults to local backend ('http://localhost:5003/api').
 * 3. Trims trailing slashes and ensures the '/api' prefix is present without duplication,
 *    so all existing endpoints (e.g. '/auth/register', '/dishes', '/reviews') map correctly to '/api/...'.
 */
export const resolveApiBaseUrl = (
  explicitUrl?: string,
  isProd: boolean = import.meta.env.PROD
): string => {
  const effectiveUrl = explicitUrl !== undefined
    ? explicitUrl
    : (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL);
  const rawUrl = effectiveUrl?.trim() || (isProd ? 'https://x45-wte-be.onrender.com/api' : 'http://localhost:5003/api');
  const sanitized = rawUrl.replace(/\/+$/, '');
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
};

const apiBaseUrl = resolveApiBaseUrl();

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const requestUrl = error?.config?.url as string | undefined;
    const isAuthEndpoint = requestUrl?.includes('/auth/login') || requestUrl?.includes('/auth/register');
    const isAuthPage = typeof window !== 'undefined' && ['/login', '/register', '/forgot-password', '/logout'].includes(window.location.pathname);

    if (status === 401) {
      tokenStore.clear();
      if (!isAuthEndpoint && !isAuthPage) {
        window.location.href = '/logout';
      }
    }

    return Promise.reject(error);
  }
);
