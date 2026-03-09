import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  Character,
  CharacterCard,
  ClassTemplate,
  GeneratedCharacter,
  PaginatedResponse
} from '../types';
import { fromCharacterDB } from '../utils/characterMapper';
import { useAuthStore } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAccessToken = (): string | null => {
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;
  return localStorage.getItem('token');
};

const getRefreshToken = (): string | null => {
  const storeRefreshToken = useAuthStore.getState().refreshToken;
  if (storeRefreshToken) return storeRefreshToken;
  return localStorage.getItem('refreshToken');
};

const clearAuthSession = (): void => {
  useAuthStore.getState().logout();
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('Missing refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        useAuthStore.setState((state) => ({
          ...state,
          token: data.token,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }));

        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

function buildCharacterPayload(data: Partial<Character>) {
  return {
    name: data.name,
    species: data.species,
    demeanor: data.demeanor,
    details: data.details,
    avatarImage: data.avatarImage,
    stats: data.stats || [],
    background: data.background || [],
    connections: data.connections || [],
    nature: data.nature?.filter(n => n.selected).map(n => ({ name: n.name, description: n.description, selected: true })) || [],
    drives: data.drives?.filter(d => d.selected).map(d => ({ name: d.name, description: d.description, selected: true })) || [],
    moves: data.moves?.filter(m => m.selected).map(m => ({ name: m.name, description: m.description, selected: true })) || [],
    roguishFeats: data.roguishFeats,
    weaponSkills: data.weaponSkills,
    equipment: data.equipment,
    reputation: data.reputation,
  };
}

export const characterAPI = {
  create: async (data: Partial<Character>): Promise<Character> => {
    const response = await api.post('/characters', {
      ...buildCharacterPayload(data),
      system: data.system,
      className: data.className,
      isPublic: data.isPublic || false,
    });
    return fromCharacterDB(response.data);
  },

  update: async (id: string, data: Partial<Character>): Promise<Character> => {
    const response = await api.put(`/characters/${id}`, {
      ...buildCharacterPayload(data),
      isPublic: data.isPublic,
    });
    return fromCharacterDB(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/characters/${id}`);
  },

  getById: async (id: string): Promise<Character> => {
    const response = await api.get(`/characters/${id}`);
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

  generateCharacter: async (
    system: string,
    className: string,
    prompt?: string,
    language?: string
  ): Promise<GeneratedCharacter> => {
    const response = await api.post('/characters/generate', {
      system,
      className,
      prompt,
      language,
    });
    return response.data;
  },

  like: async (id: string): Promise<CharacterCard> => {
    const response = await api.post(`/characters/${id}/like`);
    return response.data;
  },
};

export const avatarAPI = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/avatars/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },
};

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
