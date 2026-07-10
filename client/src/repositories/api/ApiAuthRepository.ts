import api from '../../api/api';
import { IAuthRepository, AuthResult, RegisterResult, RegisterPayload } from '../IAuthRepository';

export class ApiAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    return { token, user };
  }

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const res = await api.post('/auth/register', payload);
    const { token, user, regNumber } = res.data;
    localStorage.setItem('token', token);
    return { token, user, regNumber };
  }

  async getMe(): Promise<{ user: any }> {
    const res = await api.get('/auth/me');
    return { user: res.data.user };
  }
}
