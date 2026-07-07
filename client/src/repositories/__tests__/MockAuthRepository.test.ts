import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockAuthRepository } from '../mock/MockAuthRepository';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock mockDb
vi.mock('../../api/mockDb', () => {
  const defaultUsers = [
    { id: 'u-student-1', email: 'student@test.com', firstName: 'Test', lastName: 'Student', role: 'student', regNumber: 'RCHST-2026-00001' },
    { id: 'u-reviewer-1', email: 'reviewer@test.com', firstName: 'Test', lastName: 'Reviewer', role: 'reviewer', status: 'active' },
  ];
  const defaultSubmissions: any[] = [];
  const defaultNotifications: any[] = [];

  let users = [...defaultUsers];
  let submissions = [...defaultSubmissions];
  let notifications = [...defaultNotifications];

  return {
    getDbUsers: vi.fn(() => users),
    saveDbUsers: vi.fn((u: any) => { users = u; }),
    getDbSubmissions: vi.fn(() => submissions),
    saveDbSubmissions: vi.fn((s: any) => { submissions = s; }),
    getDbNotifications: vi.fn(() => notifications),
    saveDbNotifications: vi.fn((n: any) => { notifications = n; }),
  };
});

describe('MockAuthRepository', () => {
  let repo: MockAuthRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    repo = new MockAuthRepository();
  });

  it('login returns user and token for valid credentials', async () => {
    const result = await repo.login('student@test.com', 'any-password');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('student@test.com');
    expect(result.token).toBe('student@test.com');
    expect(localStorage.getItem('token')).toBe('student@test.com');
  });

  it('login throws for unknown email', async () => {
    await expect(repo.login('unknown@test.com', 'password'))
      .rejects.toThrow('Invalid credentials');
  });

  it('register creates a new user and submission', async () => {
    const result = await repo.register({
      fullName: 'New Student',
      email: 'new@test.com',
      phone: '08012345678',
      password: 'password123',
    });
    expect(result.user.email).toBe('new@test.com');
    expect(result.regNumber).toContain('RCHST-2026');
    expect(result.token).toBe('new@test.com');
  });

  it('register throws for duplicate email', async () => {
    await expect(repo.register({
      fullName: 'Duplicate',
      email: 'student@test.com',
      phone: '08012345678',
    })).rejects.toThrow('Email already exists');
  });

  it('getMe returns current user from token', async () => {
    localStorage.setItem('token', 'student@test.com');
    const result = await repo.getMe();
    expect(result.user.email).toBe('student@test.com');
  });

  it('getMe throws without token', async () => {
    await expect(repo.getMe()).rejects.toThrow('Unauthorized');
  });
});
