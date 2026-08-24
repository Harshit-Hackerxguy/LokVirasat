import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'contributor' | 'admin';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  userEmail: string | null;
  username: string | null;
  login: (role: UserRole, email: string, username: string) => void;
  logout: () => void;
  setUsername: (username: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      role: null,
      userEmail: null,
      username: null,
      login: (role, email, username) =>
        set({ isAuthenticated: true, role, userEmail: email, username }),
      logout: () =>
        set({ isAuthenticated: false, role: null, userEmail: null, username: null }),
      setUsername: (username) => set({ username }),
    }),
    {
      name: 'lokvirasat-auth',
    }
  )
);
