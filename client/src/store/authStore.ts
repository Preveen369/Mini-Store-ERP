import { create } from 'zustand';
import { api } from '../lib/api';
import axios from 'axios';
import type { RegisterRequest } from '../types';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true });
    } catch (error: unknown) {
      let message = 'Login failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || error.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      throw new Error(message);
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      const response = await api.register(data);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true });
    } catch (error: unknown) {
      let message = 'Registration failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || error.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
