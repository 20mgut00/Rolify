import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Character } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: (token, refreshToken, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, token, refreshToken, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
      
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CharacterState {
  currentCharacter: Character | null;
  sessionCharacters: Character[];
  setCurrentCharacter: (character: Character | null) => void;
  addSessionCharacter: (character: Character) => void;
  removeSessionCharacter: (id: string) => void;
  clearSessionCharacters: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      currentCharacter: null,
      sessionCharacters: [],
      
      setCurrentCharacter: (character) => set({ currentCharacter: character }),
      
      addSessionCharacter: (character) =>
        set((state) => ({
          sessionCharacters: [...state.sessionCharacters, character],
        })),
      
      removeSessionCharacter: (id) =>
        set((state) => ({
          sessionCharacters: state.sessionCharacters.filter((c) => c.id !== id),
        })),
      
      clearSessionCharacters: () => set({ sessionCharacters: [] }),
    }),
    {
      name: 'character-storage',
    }
  )
);

interface UIState {
  selectedSystem: string;
  selectedClass: string;
  setSelectedSystem: (system: string) => void;
  setSelectedClass: (className: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedSystem: 'Root',
  selectedClass: '',
  setSelectedSystem: (system) => set({ selectedSystem: system }),
  setSelectedClass: (className) => set({ selectedClass: className }),
}));
