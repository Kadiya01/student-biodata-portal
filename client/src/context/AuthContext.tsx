import React, { createContext, useContext, useEffect, useState } from 'react';
import { authRepo } from '../repositories';
import { RegisterPayload } from '../repositories/IAuthRepository';
import { useToast } from './ToastContext';

export type UserRole = 'student' | 'reviewer' | 'super_admin';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  regNumber?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<{ user: User; regNumber: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  const fetchMe = async () => {
    try {
      const res = await authRepo.getMe();
      setUser(res.user);
    } catch (err) {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, fetchMe is stable
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const { token, user: loggedUser } = await authRepo.login(email, password);
      setToken(token);
      setUser(loggedUser);
      toast.success(`Welcome back, ${loggedUser.firstName || 'User'}!`);
      return loggedUser;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Login failed. Please verify credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (payload: RegisterPayload): Promise<{ user: User; regNumber: string }> => {
    try {
      const { token, user: newUser, regNumber } = await authRepo.register(payload);
      toast.success('Registration Successful!');
      return { user: newUser, regNumber };
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Registration failed. Try again.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    toast.info('Logged out successfully.');
  };

  const refreshUser = async () => {
    try {
      const res = await authRepo.getMe();
      setUser(res.user);
    } catch (err) {
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
