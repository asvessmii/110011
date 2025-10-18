import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth
  auth: {
    register: async (data) => {
      const res = await api.post('/api/auth/register', data);
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
      }
      return res.data;
    },
    login: async (data) => {
      const res = await api.post('/api/auth/login', data);
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
      }
      return res.data;
    },
    logout: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
    me: async () => {
      const res = await api.get('/api/auth/me');
      return res.data;
    },
    updateMe: async (data) => {
      const res = await api.patch('/api/auth/me', data);
      return res.data;
    },
    searchByCode: async (userCode) => {
      const res = await api.get(`/api/users/search/${userCode}`);
      return res.data;
    },
  },

  // Upload
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Entities
  entities: {
    Chat: {
      create: async (data) => {
        const res = await api.post('/api/chats', data);
        return res.data;
      },
      list: async () => {
        const res = await api.get('/api/chats');
        return res.data;
      },
      update: async (id, data) => {
        const res = await api.patch(`/api/chats/${id}`, data);
        return res.data;
      },
      createWithUser: async (targetUserId) => {
        const res = await api.post(`/api/chats/with-user/${targetUserId}`);
        return res.data;
      },
    },
    Message: {
      create: async (data) => {
        const res = await api.post('/api/messages', data);
        return res.data;
      },
      filter: async (filters) => {
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/api/messages?${params}`);
        return res.data;
      },
    },
    Task: {
      create: async (data) => {
        const res = await api.post('/api/tasks', data);
        return res.data;
      },
      list: async () => {
        const res = await api.get('/api/tasks');
        return res.data;
      },
      update: async (id, data) => {
        const res = await api.patch(`/api/tasks/${id}`, data);
        return res.data;
      },
    },
    Order: {
      create: async (data) => {
        const res = await api.post('/api/orders', data);
        return res.data;
      },
      list: async () => {
        const res = await api.get('/api/orders');
        return res.data;
      },
    },
    SOS: {
      create: async (data) => {
        const res = await api.post('/api/sos', data);
        return res.data;
      },
      list: async () => {
        const res = await api.get('/api/sos');
        return res.data;
      },
    },
  },

  // Legacy support for base44 compatibility
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { file_url: API_URL + res.data.file_url };
      },
    },
  },
};

export const base44 = apiClient;