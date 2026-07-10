import request from 'supertest';
import app from '../src/app';
import * as studentService from '../src/services/studentService';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
}));

describe('Students routes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('GET /api/v1/students (reviewer)', async () => {
    const reviewerToken = signToken({ userId: 'reviewer-1', role: 'reviewer', email: 'reviewer@example.com' });
    const students = [{ id: 's1', studentNumber: '100' }];
    jest.spyOn(studentService, 'listStudents').mockResolvedValue({ students, total: 1, limit: 50, offset: 0 } as any);
    const res = await request(app).get('/api/v1/students').set('Authorization', `Bearer ${reviewerToken}`).expect(200);
    expect(res.body.students).toBeDefined();
    expect(Array.isArray(res.body.students)).toBe(true);
  }, 10000);

  test('POST /api/v1/students upsert', async () => {
    const userToken = signToken({ userId: 'u1', role: 'student', email: 'stu@example.com' });
    const profile = { id: 'p1', userId: 'u1', studentNumber: 'S001' } as any;
    jest.spyOn(studentService, 'createOrUpdateStudent').mockResolvedValue(profile);
    const res = await request(app).post('/api/v1/students').set('Authorization', `Bearer ${userToken}`).send({ userId: 'u1' }).expect(200);
    expect(res.body.profile.id).toBe(profile.id);
  }, 10000);

  test('GET /api/v1/students (student) should 403', async () => {
    const studentToken = signToken({ userId: 's1', role: 'student', email: 'stu@example.com' });
    await request(app).get('/api/v1/students').set('Authorization', `Bearer ${studentToken}`).expect(403);
  }, 10000);
});
