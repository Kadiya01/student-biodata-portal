import api from '../../api/api';
import { IAuthRepository, AuthResult, RegisterResult, RegisterPayload } from '../IAuthRepository';

export class ApiAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await api.post('/auth/login', { email, password });
    const { token, user, refreshToken } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    return { token, user, refreshToken };
  }

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const res = await api.post('/auth/register', payload);
    const { token, user, regNumber, refreshToken } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    return { token, user, regNumber, refreshToken };
  }

  async getMe(): Promise<{ user: any }> {
    const res = await api.get('/auth/me');
    return { user: res.data.user };
  }

  async forgotPassword(email: string): Promise<{ message: string; resetLink?: string }> {
    const res = await api.post('/auth/forgot-password', { email });
    return { message: res.data.message, resetLink: res.data.resetLink };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const res = await api.post('/auth/reset-password', { token, password });
    return { message: res.data.message };
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return { message: res.data.message };
  }
}
