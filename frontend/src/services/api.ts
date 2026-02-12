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
import { fromCharacterDB } from '../utils/characterMapper';

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

  deleteAccount: async (): Promise<void> => {
    await api.delete('/auth/delete-account');
  },
};

// Character API
export const characterAPI = {
  create: async (data: Partial<Character>): Promise<Character> => {
    // Prepare data for backend API (keep nature as array, not object)
    const apiData = {
      name: data.name,
      system: data.system,
      className: data.className,
      species: data.species,
      demeanor: data.demeanor,
      details: data.details,
      avatarImage: data.avatarImage,
      stats: data.stats || [],
      background: data.background || [],
      connections: data.connections || [],
      isPublic: data.isPublic || false,
      // Filter and map to remove 'selected' field, keep as array
      nature: data.nature?.filter(n => n.selected).map(n => ({ name: n.name, description: n.description, selected: true })) || [],
      drives: data.drives?.filter(d => d.selected).map(d => ({ name: d.name, description: d.description, selected: true })) || [],
      moves: data.moves?.filter(m => m.selected).map(m => ({ name: m.name, description: m.description, selected: true })) || [],
      roguishFeats: data.roguishFeats,
      weaponSkills: data.weaponSkills,
      equipment: data.equipment,
      reputation: data.reputation
    };

    const response = await api.post('/characters', apiData);
    return fromCharacterDB(response.data);
  },

  update: async (id: string, data: Partial<Character>): Promise<Character> => {
    // Prepare data for backend API (keep nature as array, not object)
    const apiData = {
      name: data.name,
      species: data.species,
      demeanor: data.demeanor,
      details: data.details,
      avatarImage: data.avatarImage,
      stats: data.stats || [],
      background: data.background || [],
      connections: data.connections || [],
      isPublic: data.isPublic,
      // Filter and map to remove 'selected' field, keep as array
      nature: data.nature?.filter(n => n.selected).map(n => ({ name: n.name, description: n.description, selected: true })) || [],
      drives: data.drives?.filter(d => d.selected).map(d => ({ name: d.name, description: d.description, selected: true })) || [],
      moves: data.moves?.filter(m => m.selected).map(m => ({ name: m.name, description: m.description, selected: true })) || [],
      roguishFeats: data.roguishFeats,
      weaponSkills: data.weaponSkills,
      equipment: data.equipment,
      reputation: data.reputation
    };

    const response = await api.put(`/characters/${id}`, apiData);
    return fromCharacterDB(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/characters/${id}`);
  },

  getById: async (id: string): Promise<Character> => {
    const response = await api.get(`/characters/${id}`);
    // Convert MongoDB response to UI Character
    return fromCharacterDB(response.data);
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

// Avatar API
export const avatarAPI = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/avatars/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url; // Returns "/api/avatars/{filename}"
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
