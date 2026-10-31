import axios from 'axios';

/**
 * Normalizes the API Base URL from environment variables.
 * Handles:
 * - Full URLs: https://biz-solution-backend.vercel.app -> https://biz-solution-backend.vercel.app/api/v1
 * - Full URLs with /api/v1: https://biz-solution-backend.vercel.app/api/v1 -> https://biz-solution-backend.vercel.app/api/v1
 * - URLs with trailing slash: https://biz-solution-backend.vercel.app/api/v1/ -> https://biz-solution-backend.vercel.app/api/v1
 * - Relative paths: /api/v1 -> /api/v1
 * - Default fallback: /api/v1
 */
export const normalizeBaseUrl = (rawUrl) => {
  let url = (rawUrl || '/api/v1').trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // If it's a full URL or root path without /api/v1, ensure /api/v1 suffix is attached
  if (!url.endsWith('/api/v1')) {
    if (url.endsWith('/api')) {
      url = `${url}/v1`;
    } else if (!url.includes('/api/v1')) {
      url = `${url}/api/v1`;
    }
  }

  return url;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

/**
 * Helper to resolve uploaded media or file asset URLs from the backend.
 */
export const getAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (
    assetPath.startsWith('http://') ||
    assetPath.startsWith('https://') ||
    assetPath.startsWith('data:') ||
    assetPath.startsWith('blob:')
  ) {
    return assetPath;
  }
  // Strip /api/v1 to get server origin
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${origin}${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizzolution_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';

    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      if (localStorage.getItem('bizzolution_token')) {
        localStorage.removeItem('bizzolution_token');
        localStorage.removeItem('bizzolution_user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
