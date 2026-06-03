const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitpred_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fitpred_token');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

const AuthAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  changeUsername: (data) => api.put('/auth/change-username', data),
};

const ProfileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updateAvatar: (data) => api.put('/profile/avatar', data),
};

const HealthAPI = {
  predict: (data) => api.post('/health/predict', data),
  getHistory: (params) => api.get('/health/history', { params }),
  getPrediction: (id) => api.get(`/health/history/${id}`),
  getDashboardStats: () => api.get('/health/dashboard-stats'),
};
