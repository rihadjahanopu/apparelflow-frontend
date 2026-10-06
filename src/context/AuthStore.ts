import { create } from 'zustand';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  activeRole: UserRole;
  isLoading: boolean;
  error: string | null;
  demoUsers: User[];
  switchRole: (role: UserRole) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerOperator: (email: string, password: string, full_name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: { full_name?: string; current_password?: string; new_password?: string }) => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  activeRole: 'cutting_supervisor',
  isLoading: true,
  error: null,
  demoUsers: [],

  clearError: () => set({ error: null }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('apparelflow_token');
      localStorage.removeItem('apparelflow_role');
      localStorage.setItem('apparelflow_logged_out', 'true');
    }
    set({
      token: null,
      user: null,
      isLoading: false,
    });
  },

  switchRole: async (role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.switchDemoRole(role);
      if (typeof window !== 'undefined') {
        localStorage.setItem('apparelflow_token', response.token);
        localStorage.setItem('apparelflow_role', response.user.role);
        localStorage.removeItem('apparelflow_logged_out');
      }
      set({
        token: response.token,
        user: response.user,
        activeRole: response.user.role,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to switch demo role.',
        isLoading: false,
      });
    }
  },

  loginWithCredentials: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.login({ email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('apparelflow_token', response.token);
        localStorage.setItem('apparelflow_role', response.user.role);
        localStorage.removeItem('apparelflow_logged_out');
      }
      set({
        token: response.token,
        user: response.user,
        activeRole: response.user.role,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Invalid credentials or login failed.',
        isLoading: false,
      });
      throw err;
    }
  },

  registerOperator: async (email: string, password: string, full_name: string, role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.register({ email, password, full_name, role });
      if (typeof window !== 'undefined') {
        localStorage.setItem('apparelflow_token', response.token);
        localStorage.setItem('apparelflow_role', response.user.role);
        localStorage.removeItem('apparelflow_logged_out');
      }
      set({
        token: response.token,
        user: response.user,
        activeRole: response.user.role,
        isLoading: false,
      });
      // Refresh demo users list
      const { users } = await api.auth.getDemoUsers();
      set({ demoUsers: users });
    } catch (err: any) {
      set({
        error: err.message || 'Registration failed.',
        isLoading: false,
      });
      throw err;
    }
  },

  updateProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.updateProfile(payload);
      if (typeof window !== 'undefined' && response.token) {
        localStorage.setItem('apparelflow_token', response.token);
      }
      set({
        user: response.user,
        activeRole: response.user.role,
        token: response.token || get().token,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to update profile.',
        isLoading: false,
      });
      throw err;
    }
  },

  initAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch available demo users in background
      api.auth
        .getDemoUsers()
        .then(({ users }) => set({ demoUsers: users }))
        .catch(() => {});

      if (typeof window === 'undefined') {
        set({ isLoading: false });
        return;
      }

      const isLoggedOut = localStorage.getItem('apparelflow_logged_out') === 'true';
      const storedToken = localStorage.getItem('apparelflow_token');

      // If user explicitly logged out or no token is found, stay logged out!
      if (isLoggedOut || !storedToken) {
        set({
          token: null,
          user: null,
          isLoading: false,
        });
        return;
      }

      // Otherwise validate existing token with backend /api/auth/me
      try {
        const { user } = await api.auth.getMe();
        set({
          token: storedToken,
          user,
          activeRole: user.role,
          isLoading: false,
        });
      } catch {
        // Token expired or invalid: clear and stay logged out
        localStorage.removeItem('apparelflow_token');
        localStorage.removeItem('apparelflow_role');
        set({
          token: null,
          user: null,
          isLoading: false,
        });
      }
    } catch {
      set({
        token: null,
        user: null,
        isLoading: false,
      });
    }
  },
}));
