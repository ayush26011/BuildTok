import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175/api';

// ── Standard API instance (60s timeout) ────────────────────────────
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Upload API instance (5 min timeout for Cloudinary video uploads) ─
export const UPLOAD_API = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 minutes — Cloudinary video processing can be slow
});

// Shared token injector
const injectToken = (config) => {
  const token = localStorage.getItem('buildtok_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log request for message APIs
  if (config.url && config.url.includes('/messages')) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  }
  return config;
};

// Shared error formatter
const formatError = (error) => {
  const errorMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'An unexpected error occurred';
  const customError = new Error(errorMessage);
  customError.status = error.response?.status;
  customError.originalError = error;

  // Log error for message APIs
  if (error.config?.url?.includes('/messages')) {
    console.error(`[API Error] ${error.config.url} Status: ${error.response?.status || 'unknown'}: ${errorMessage}`);
  }
  return Promise.reject(customError);
};

// Apply interceptors to both instances
API.interceptors.request.use(injectToken, (e) => Promise.reject(e));
API.interceptors.response.use((r) => {
  // Log successful response for message APIs
  if (r.config?.url?.includes('/messages')) {
    console.log(`[API Response] ${r.config.url} Status: ${r.status}`, r.data);
  }
  return r.data;
}, formatError);

UPLOAD_API.interceptors.request.use(injectToken, (e) => Promise.reject(e));
UPLOAD_API.interceptors.response.use((r) => r.data, formatError);

export default API;
