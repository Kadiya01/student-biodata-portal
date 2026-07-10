import request from 'supertest';
import app from '../src/app';
import * as programmeService from '../src/services/programmeService';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
}));

describe('Programmes routes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('GET /api/v1/programmes lists programmes', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });
    const programmes = [{ id: 'p1', name: 'Nursing', code: 'NUR' }];
    jest.spyOn(programmeService, 'listProgrammes').mockResolvedValue(programmes as any);

    const res = await request(app)
      .get('/api/v1/programmes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.programmes).toBeDefined();
    expect(Array.isArray(res.body.programmes)).toBe(true);
  });

  test('GET /api/v1/programmes/departments lists departments', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });
    const departments = [{ id: 'd1', name: 'Health Sciences' }];
    jest.spyOn(programmeService, 'listDepartments').mockResolvedValue(departments as any);

    const res = await request(app)
      .get('/api/v1/programmes/departments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.departments).toBeDefined();
    expect(res.body.departments).toHaveLength(1);
  });

  test('GET /api/v1/programmes/:id returns a programme', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });
    const programme = { id: 'p1', name: 'Nursing' };
    jest.spyOn(programmeService, 'getProgramme').mockResolvedValue(programme as any);

    const res = await request(app)
      .get('/api/v1/programmes/p1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.programme.name).toBe('Nursing');
  });

  test('GET /api/v1/programmes/:id returns 404 for non-existent', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });
    jest.spyOn(programmeService, 'getProgramme').mockResolvedValue(null);

    await request(app)
      .get('/api/v1/programmes/nonexistent')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('POST /api/v1/programmes creates a programme (super_admin)', async () => {
    const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'admin@test.com' });
    const created = { id: 'p2', name: 'Pharmacy', code: 'PHR' };
    jest.spyOn(programmeService, 'createProgramme').mockResolvedValue(created as any);

    const res = await request(app)
      .post('/api/v1/programmes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Pharmacy', code: 'PHR' })
      .expect(201);

    expect(res.body.programme.name).toBe('Pharmacy');
  });

  test('POST /api/v1/programmes returns 403 for student', async () => {
    const token = signToken({ userId: 's1', role: 'student', email: 'stu@test.com' });
    await request(app)
      .post('/api/v1/programmes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X', code: 'X' })
      .expect(403);
  });

  test('DELETE /api/v1/programmes/:id deletes a programme (super_admin)', async () => {
    const token = signToken({ userId: 'admin1', role: 'super_admin', email: 'admin@test.com' });
    jest.spyOn(programmeService, 'deleteProgramme').mockResolvedValue(undefined as any);

    const res = await request(app)
      .delete('/api/v1/programmes/p1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('GET /api/v1/programmes returns 401 without token', async () => {
    await request(app).get('/api/v1/programmes').expect(401);
  });
});
