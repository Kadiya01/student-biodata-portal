import request from 'supertest';
import app from '../src/app';
import * as passwordResetService from '../src/services/passwordResetService';

jest.mock('../src/services/auditService', () => ({
  log: jest.fn().mockResolvedValue(undefined),
}));

describe('Password Reset routes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('POST /api/v1/auth/forgot-password returns success message', async () => {
    jest.spyOn(passwordResetService, 'requestPasswordReset').mockResolvedValue({
      message: 'If an account exists, a reset link has been generated.',
    });

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'test@test.com' })
      .expect(200);

    expect(res.body.message).toBeDefined();
  });

  test('POST /api/v1/auth/forgot-password validates email format', async () => {
    await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  test('POST /api/v1/auth/forgot-password requires email field', async () => {
    await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({})
      .expect(400);
  });

  test('POST /api/v1/auth/reset-password with valid token succeeds', async () => {
    jest.spyOn(passwordResetService, 'resetPassword').mockResolvedValue({
      message: 'Password reset successful',
    });

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'valid-token-abc', password: 'newPassword123' })
      .expect(200);

    expect(res.body.message).toBe('Password reset successful');
  });

  test('POST /api/v1/auth/reset-password with invalid token fails', async () => {
    jest.spyOn(passwordResetService, 'resetPassword').mockRejectedValue(
      new Error('Invalid or expired token')
    );

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'bad-token', password: 'newPassword123' })
      .expect(500);

    expect(res.body.error).toBeDefined();
  });

  test('POST /api/v1/auth/reset-password requires token and password', async () => {
    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({})
      .expect(400);
  });
});
