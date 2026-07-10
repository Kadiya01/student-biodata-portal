import request from 'supertest';
import app from '../src/app';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/prismaClient', () => {
  const mockPrisma = {
    document: {
      create: jest.fn().mockResolvedValue({
        id: 'doc1',
        studentId: 's1',
        fileUrl: 'uploads/test.jpg',
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        sizeBytes: 1024,
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
  return { __esModule: true, default: mockPrisma };
});

describe('Documents routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/v1/documents/:studentId returns 200 with auth', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });

    const res = await request(app)
      .get('/api/v1/documents/s1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('docs');
    expect(Array.isArray(res.body.docs)).toBe(true);
  });

  test('GET /api/v1/documents/:studentId returns 401 without token', async () => {
    await request(app)
      .get('/api/v1/documents/s1')
      .expect(401);
  });

  test('POST /api/v1/documents/upload returns 401 without token', async () => {
    await request(app)
      .post('/api/v1/documents/upload')
      .field('studentId', '550e8400-e29b-41d4-a716-446655440000')
      .expect(401);
  });

  test('POST /api/v1/documents/upload returns 400 without studentId validation', async () => {
    const token = signToken({ userId: 'u1', role: 'student', email: 'stu@test.com' });

    await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
  });
});
