import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trustlense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// API modules
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const scanApi = {
  createScan: (data) => api.post('/scan', data),
  getScans: (params) => api.get('/scans', { params }),
  getScanById: (id) => api.get(`/scans/${id}`),
  deleteScan: (id) => api.delete(`/scans/${id}`)
};

export const chatApi = {
  sendMessage: (data) => api.post('/chat', data)
};

export const statsApi = {
  getStats: () => api.get('/stats')
};

export const privacyApi = {
  getAuditLogs: () => api.get('/audit-logs'),
  deleteMyData: () => api.delete('/me/data')
};

export const ticketApi = {
  createTicket: (data) => api.post('/tickets', data)
};

export const healthApi = {
  check: () => api.get('/health')
};
