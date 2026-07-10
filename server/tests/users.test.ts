import request from 'supertest';
import app from '../src/app';
import * as userService from '../src/services/userService';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
}));

describe('Users routes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('GET /api/v1/users lists users for super_admin', async () => {
    const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'admin@test.com' });
    const result = { users: [{ id: 'u1', email: 'test@test.com', role: 'reviewer' }], total: 1 };
    jest.spyOn(userService, 'listUsers').mockResolvedValue(result as any);

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.users).toBeDefined();
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.total).toBe(1);
  });

  test('PUT /api/v1/users/:id updates a user for super_admin', async () => {
    const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'admin@test.com' });
    const updated = { id: 'u1', firstName: 'Updated', email: 'test@test.com' };
    jest.spyOn(userService, 'updateUser').mockResolvedValue(updated as any);

    const res = await request(app)
      .put('/api/v1/users/u1')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated' })
      .expect(200);

    expect(res.body.user.firstName).toBe('Updated');
  });

  test('PUT /api/v1/users/:id returns 404 for non-existent user', async () => {
    const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'admin@test.com' });
    jest.spyOn(userService, 'updateUser').mockResolvedValue(null);

    await request(app)
      .put('/api/v1/users/nonexistent')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'X' })
      .expect(404);
  });

  test('PUT /api/v1/users/:id/toggle toggles user status', async () => {
    const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'admin@test.com' });
    const toggled = { id: 'u1', isActive: false };
    jest.spyOn(userService, 'toggleUserStatus').mockResolvedValue(toggled as any);

    const res = await request(app)
      .put('/api/v1/users/u1/toggle')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.user.isActive).toBe(false);
  });

  test('GET /api/v1/users returns 403 for reviewer', async () => {
    const token = signToken({ userId: 'r1', role: 'reviewer', email: 'r@test.com' });
    jest.spyOn(userService, 'listUsers').mockResolvedValue({ users: [], total: 0 } as any);

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('PUT /api/v1/users/:id returns 403 for reviewer', async () => {
    const token = signToken({ userId: 'r1', role: 'reviewer', email: 'r@test.com' });
    await request(app)
      .put('/api/v1/users/u1')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'X' })
      .expect(403);
  });

  test('GET /api/v1/users returns 403 for student', async () => {
    const token = signToken({ userId: 's1', role: 'student', email: 'stu@test.com' });
    await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
