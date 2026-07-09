import { User } from '../api/mockDb';

export interface RegisterPayload {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface RegisterResult {
  user: User;
  token: string;
  regNumber: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthResult>;
  register(payload: RegisterPayload): Promise<RegisterResult>;
  getMe(): Promise<{ user: User }>;
}
