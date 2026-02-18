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
  getToken: () => string | null;
  getRefreshToken: () => string | null;
}

/**
 * Simplified auth store - Zustand persist middleware handles localStorage automatically.
 * No need for manual localStorage.setItem/removeItem calls.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (token, refreshToken, user) => {
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      getToken: () => get().token,

      getRefreshToken: () => get().refreshToken,
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

interface AccessibilityState {
  darkMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  language: string;
  setDarkMode: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
}

const supportedLngs = ['en', 'es'];
const browserLng = navigator.language.split('-')[0];
const defaultLanguage = supportedLngs.includes(browserLng) ? browserLng : 'en';

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      darkMode: false,
      reducedMotion: false,
      largeText: false,
      language: defaultLanguage,
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setLargeText: (enabled) => set({ largeText: enabled }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'accessibility-storage',
    }
  )
);
