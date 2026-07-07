import request from 'supertest';
import app from '../src/app';
import * as studentService from '../src/services/studentService';
import { signToken } from '../src/utils/jwt';

describe('Students routes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('GET /api/v1/students (admin)', async () => {
    const adminToken = signToken({ userId: 'admin-1', role: 'admin', email: 'admin@example.com' });
    const students = [{ id: 's1', studentNumber: '100' }];
    jest.spyOn(studentService, 'listStudents').mockResolvedValue(students as any);
    const res = await request(app).get('/api/v1/students').set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(res.body.students).toBeDefined();
    expect(Array.isArray(res.body.students)).toBe(true);
  });

  test('POST /api/v1/students upsert', async () => {
    const userToken = signToken({ userId: 'u1', role: 'student', email: 'stu@example.com' });
    const profile = { id: 'p1', userId: 'u1', studentNumber: 'S001' } as any;
    jest.spyOn(studentService, 'createOrUpdateStudent').mockResolvedValue(profile);
    const res = await request(app).post('/api/v1/students').set('Authorization', `Bearer ${userToken}`).send({ userId: 'u1' }).expect(200);
    expect(res.body.profile.id).toBe(profile.id);
  });
});
