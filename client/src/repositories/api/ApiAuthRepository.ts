import axios from 'axios';
import { IAuthRepository, AuthResult, RegisterResult, RegisterPayload } from '../IAuthRepository';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api/v1',
});

export class ApiAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { token, user };
  }

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const res = await api.post('/auth/register', payload);
    const { token, user, regNumber } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { token, user, regNumber };
  }

  async getMe(): Promise<{ user: any }> {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const res = await api.get('/auth/me');
    return { user: res.data.user };
  }
}
