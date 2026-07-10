import request from 'supertest';
import app from '../src/app';
import * as authService from '../src/services/authService';
import * as userService from '../src/services/userService';
import * as studentService from '../src/services/studentService';
import * as auditService from '../src/services/auditService';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
}));

describe('Security tests', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('Privilege escalation', () => {
    test('POST /api/v1/auth/register rejects super_admin role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'attacker@test.com', password: 'Password1', role: 'super_admin' });
      expect(res.status).toBe(400);
    });

    test('POST /api/v1/auth/register rejects reviewer role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'attacker@test.com', password: 'Password1', role: 'reviewer' });
      expect(res.status).toBe(400);
    });

    test('POST /api/v1/auth/register accepts student role', async () => {
      jest.spyOn(authService, 'registerUser').mockResolvedValue({
        user: { id: 'u1', role: 'student' },
        token: 't',
        refreshToken: 'r',
        regNumber: 'RCHST-2026-00001',
      } as any);
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'student@test.com', password: 'Password1', role: 'student' });
      expect(res.status).toBe(201);
    });
  });

  describe('IDOR protection', () => {
    test('Student cannot upsert another student profile', async () => {
      const token = signToken({ userId: 'own-user', role: 'student', email: 's@test.com' });
      jest.spyOn(studentService, 'createOrUpdateStudent').mockResolvedValue({ id: 'p1', userId: 'own-user' } as any);

      await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'other-user', programmeId: 'p1' })
        .expect(200);

      expect(studentService.createOrUpdateStudent).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'own-user' }),
      );
    });

    test('Reviewer can upsert any student profile', async () => {
      const token = signToken({ userId: 'reviewer1', role: 'reviewer', email: 'r@test.com' });
      jest.spyOn(studentService, 'createOrUpdateStudent').mockResolvedValue({ id: 'p1', userId: 'target-user' } as any);

      await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'target-user', programmeId: 'p1' })
        .expect(200);

      expect(studentService.createOrUpdateStudent).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'target-user' }),
      );
    });
  });

  describe('Unauthorized access', () => {
    test('GET /api/v1/students requires auth', async () => {
      await request(app).get('/api/v1/students').expect(401);
    });

    test('GET /api/v1/users requires auth', async () => {
      await request(app).get('/api/v1/users').expect(401);
    });

    test('GET /api/v1/audit requires auth', async () => {
      await request(app).get('/api/v1/audit').expect(401);
    });

    test('DELETE /api/v1/students/:id requires super_admin', async () => {
      const token = signToken({ userId: 'u1', role: 'student', email: 's@test.com' });
      await request(app)
        .delete('/api/v1/students/some-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    test('POST /api/v1/programmes requires super_admin', async () => {
      const token = signToken({ userId: 'u1', role: 'student', email: 's@test.com' });
      await request(app)
        .post('/api/v1/programmes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'X', code: 'X' })
        .expect(403);
    });
  });

  describe('Input validation', () => {
    test('Registration rejects short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com', password: 'short' });
      expect(res.status).toBe(400);
    });

    test('Registration rejects password without uppercase', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com', password: 'lowercase1' });
      expect(res.status).toBe(400);
    });

    test('Registration rejects password without number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com', password: 'NoNumberHere' });
      expect(res.status).toBe(400);
    });

    test('Registration rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'Password1' });
      expect(res.status).toBe(400);
    });
  });

  describe('Refresh endpoint rate limiting', () => {
    test('POST /api/v1/auth/refresh exists and requires body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Refresh token required');
    });
  });

  describe('Pagination', () => {
    test('GET /api/v1/users returns paginated response', async () => {
      const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'a@test.com' });
      jest.spyOn(userService, 'listUsers').mockResolvedValue({ users: [], total: 0 } as any);

      const res = await request(app)
        .get('/api/v1/users?limit=10&offset=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(userService.listUsers).toHaveBeenCalledWith(undefined, 10, 0);
    });
  });
});
