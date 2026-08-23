import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'contributor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  loginError: string | null;
  loginAsAdmin: (adminId: string, password: string) => boolean;
  loginAsContributor: (email: string, password: string) => boolean;
  logout: () => void;
  clearError: () => void;
}

// ─── Dummy Accounts ───────────────────────────────────────────────────────────
const DUMMY_ACCOUNTS = {
  admin: {
    adminId: 'ADMIN001',
    password: 'Admin@1234',
    user: {
      id: 'admin-001',
      name: 'Ravi Shankar',
      email: 'admin@lokvirasat.in',
      role: 'admin' as UserRole,
    },
  },
  contributor: {
    email: 'contributor@lokvirasat.in',
    password: 'Contrib@123',
    user: {
      id: 'contrib-001',
      name: 'Priya Mehta',
      email: 'contributor@lokvirasat.in',
      role: 'contributor' as UserRole,
    },
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loginError: null,

      loginAsAdmin: (adminId: string, password: string): boolean => {
        const { admin } = DUMMY_ACCOUNTS;
        if (adminId === admin.adminId && password === admin.password) {
          set({ user: admin.user, loginError: null });
          return true;
        }
        set({ loginError: 'Invalid Admin ID or password.' });
        return false;
      },

      loginAsContributor: (email: string, password: string): boolean => {
        const { contributor } = DUMMY_ACCOUNTS;
        if (
          email === contributor.email &&
          password === contributor.password
        ) {
          set({ user: contributor.user, loginError: null });
          return true;
        }
        set({ loginError: 'Invalid email or password.' });
        return false;
      },

      logout: () => set({ user: null, loginError: null }),

      clearError: () => set({ loginError: null }),
    }),
    {
      name: 'lokvirasat-auth',
    }
  )
);
