import request from 'supertest';
import app from '../src/app';
import * as authService from '../src/services/authService';
import { signToken } from '../src/utils/jwt';

describe('Auth routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('POST /api/v1/auth/register', async () => {
    const user = { id: 'u1', email: 'test@example.com', role: { name: 'student' } } as any;
    const token = signToken({ userId: user.id, role: user.role.name, email: user.email });
    jest.spyOn(authService, 'registerUser').mockResolvedValue({ user, token } as any);

    const res = await request(app).post('/api/v1/auth/register').send({ email: user.email, password: 'password123' }).expect(200);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.token).toBe(token);
  });

  test('POST /api/v1/auth/login', async () => {
    const user = { id: 'u1', email: 'test@example.com', role: { name: 'student' } } as any;
    const token = signToken({ userId: user.id, role: user.role.name, email: user.email });
    jest.spyOn(authService, 'loginUser').mockResolvedValue({ user, token } as any);

    const res = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'password123' }).expect(200);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.token).toBe(token);
  });

  test('GET /api/v1/auth/me', async () => {
    const user = { id: 'u1', email: 'test@example.com', role: { name: 'student' } } as any;
    const token = signToken({ userId: user.id, role: user.role.name, email: user.email });
    jest.spyOn(authService, 'getUserById').mockResolvedValue(user as any);
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.user.email).toBe(user.email);
  });
});
