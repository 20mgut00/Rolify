import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  Character,
  CharacterCard,
  ClassTemplate,
  PaginatedResponse
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post(`/auth/verify-email?token=${token}`);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/auth/change-password', data);
  },
};

// Character API
export const characterAPI = {
  create: async (data: Partial<Character>): Promise<Character> => {
    const response = await api.post('/characters', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Character>): Promise<Character> => {
    const response = await api.put(`/characters/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/characters/${id}`);
  },

  getById: async (id: string): Promise<Character> => {
    const response = await api.get(`/characters/${id}`);
    return response.data;
  },

  getMyCharacters: async (): Promise<CharacterCard[]> => {
    const response = await api.get('/characters/my');
    return response.data;
  },

  getPublicCharacters: async (
    page: number = 0,
    size: number = 12,
    system?: string,
    className?: string
  ): Promise<PaginatedResponse<CharacterCard>> => {
    const params: Record<string, string | number> = { page, size };
    if (system) params.system = system;
    if (className) params.className = className;

    const response = await api.get('/characters/public', { params });
    return response.data;
  },
};

// Class Template API
export const classTemplateAPI = {
  getAll: async (): Promise<ClassTemplate[]> => {
    const response = await api.get('/class-templates');
    return response.data;
  },

  getBySystem: async (system: string): Promise<ClassTemplate[]> => {
    const response = await api.get(`/class-templates/systems/${system}`);
    return response.data;
  },

  getBySystemAndClass: async (
    system: string,
    className: string
  ): Promise<ClassTemplate> => {
    const response = await api.get(
      `/class-templates/systems/${system}/classes/${className}`
    );
    return response.data;
  },
};

export default api;
