import request from 'supertest';
import app from '../src/app';
import * as notificationService from '../src/services/notificationService';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
}));

describe('Notifications routes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('GET /api/v1/notifications lists notifications', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });
    const notifs = [{ id: 'n1', title: 'Test', message: 'Hello', read: false }];
    jest.spyOn(notificationService, 'listNotifications').mockResolvedValue(notifs as any);

    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.notifications).toBeDefined();
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  test('PUT /api/v1/notifications/:id/read marks a notification as read', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });
    jest.spyOn(notificationService, 'markAsRead').mockResolvedValue({ count: 1 } as any);

    const res = await request(app)
      .put('/api/v1/notifications/n1/read')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('PUT /api/v1/notifications/read-all marks all as read', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });
    jest.spyOn(notificationService, 'markAllAsRead').mockResolvedValue({ count: 3 } as any);

    const res = await request(app)
      .put('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('GET /api/v1/notifications returns 401 without token', async () => {
    await request(app).get('/api/v1/notifications').expect(401);
  });
});
