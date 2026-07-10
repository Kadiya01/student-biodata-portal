import request from 'supertest';
import app from '../src/app';
import * as auditService from '../src/services/auditService';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
  listLogs: jest.fn().mockResolvedValue([]),
}));

describe('Audit routes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('GET /api/v1/audit returns logs for reviewer', async () => {
    const token = signToken({ userId: 'r1', role: 'reviewer', email: 'r@test.com' });
    const logs = [{ id: 'a1', action: 'approve_student' }];
    jest.spyOn(auditService, 'listLogs').mockResolvedValue(logs as any);

    const res = await request(app)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.logs).toBeDefined();
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  test('GET /api/v1/audit returns logs for super_admin', async () => {
    const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'admin@test.com' });
    jest.spyOn(auditService, 'listLogs').mockResolvedValue([{ id: 'a2' }] as any);

    const res = await request(app)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.logs).toHaveLength(1);
  });

  test('GET /api/v1/audit returns 403 for student', async () => {
    const token = signToken({ userId: 's1', role: 'student', email: 'stu@test.com' });
    await request(app)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  test('GET /api/v1/audit returns 401 without token', async () => {
    await request(app).get('/api/v1/audit').expect(401);
  });
});
