import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // send httpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: transparent token refresh ──────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const newToken = data.tokens.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── API helpers ───────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const simulationsApi = {
  list: (params) => api.get('/simulations', { params }),
  get: (id) => api.get(`/simulations/${id}`),
  create: (data) => api.post('/simulations', data),
  update: (id, data) => api.patch(`/simulations/${id}`, data),
  delete: (id) => api.delete(`/simulations/${id}`),
  run: (id, config) => api.post(`/simulations/${id}/run`, { config }),
  listRuns: (id, params) => api.get(`/simulations/${id}/runs`, { params }),
};

export const runsApi = {
  list: (params) => api.get('/runs', { params }),
  get: (id) => api.get(`/runs/${id}`),
  update: (id, data) => api.patch(`/runs/${id}`, data),
  delete: (id) => api.delete(`/runs/${id}`),
  getSteps: (id, params) => api.get(`/runs/${id}/steps`, { params }),
};

export const progressApi = {
  get: () => api.get('/progress'),
  leaderboard: () => api.get('/progress/leaderboard'),
};
