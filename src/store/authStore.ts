// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Datos de usuarios demo (en clase 9 esto vendrá del API real)
const DEMO_USERS: Record<string, User> = {
  'admin@empresa.com': {
    id: 1,
    name: 'Roberto Silva',
    email: 'admin@empresa.com',
    role: 'admin',
    token: 'mock-token-admin-xyz',
  },
  'rrhh@empresa.com': {
    id: 2,
    name: 'Carlos Martínez',
    email: 'rrhh@empresa.com',
    role: 'hr',
    token: 'mock-token-hr-xyz',
  },
  'empleado@empresa.com': {
    id: 3,
    name: 'Ana García',
    email: 'empleado@empresa.com',
    role: 'employee',
    token: 'mock-token-employee-xyz',
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        // Simular latencia de red
        await new Promise(resolve => setTimeout(resolve, 800));

        const demoUser = DEMO_USERS[credentials.email];

        if (demoUser && credentials.password === '123456') {
          set({
            user: demoUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: 'Credenciales incorrectas. Usa cualquier email demo con contraseña: 123456',
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Solo persistir user e isAuthenticated (no isLoading ni error)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
