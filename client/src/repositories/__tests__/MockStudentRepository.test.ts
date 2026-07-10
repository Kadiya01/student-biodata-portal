import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockStudentRepository } from '../mock/MockStudentRepository';

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

vi.mock('../../api/mockDb', () => {
  const defaultUsers = [
    { id: 'u-student-1', email: 'student@test.com', firstName: 'Test', lastName: 'Student', role: 'student', regNumber: 'RCHST-2026-00001' },
  ];
  const defaultSubmissions = [
    {
      id: 'sub-1',
      studentId: 'u-student-1',
      fullName: 'Test Student',
      regNumber: 'RCHST-2026-00001',
      status: 'Draft',
      biodata: { firstName: 'Test' },
      submissionDate: null,
      reviewDate: null,
      reviewerComments: '',
    },
  ];

  let users = [...defaultUsers];
  let submissions = [...defaultSubmissions];
  let notifications: any[] = [];

  return {
    getDbUsers: vi.fn(() => users),
    saveDbUsers: vi.fn((u: any) => { users = u; }),
    getDbSubmissions: vi.fn(() => submissions),
    saveDbSubmissions: vi.fn((s: any) => { submissions = s; }),
    getDbNotifications: vi.fn(() => notifications),
    saveDbNotifications: vi.fn((n: any) => { notifications = n; }),
  };
});

describe('MockStudentRepository', () => {
  let repo: MockStudentRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    repo = new MockStudentRepository();
  });

  it('getBiodata returns submission for logged-in student', async () => {
    localStorage.setItem('token', 'student@test.com');
    const result = await repo.getBiodata();
    expect(result.submission).toBeDefined();
    expect(result.submission?.id).toBe('sub-1');
  });

  it('getBiodata throws for non-student user', async () => {
    localStorage.setItem('token', 'nonexistent@test.com');
    await expect(repo.getBiodata()).rejects.toThrow('Forbidden');
  });

  it('getBiodata throws without token', async () => {
    await expect(repo.getBiodata()).rejects.toThrow('Forbidden');
  });

  it('saveBiodata saves draft successfully', async () => {
    localStorage.setItem('token', 'student@test.com');
    const result = await repo.saveBiodata({
      biodata: { firstName: 'Updated' },
      action: 'save',
    });
    expect(result.submission.status).toBe('Draft');
    expect(result.submission.biodata.firstName).toBe('Updated');
  });

  it('saveBiodata submits successfully', async () => {
    localStorage.setItem('token', 'student@test.com');
    const result = await repo.saveBiodata({
      biodata: { firstName: 'Final' },
      action: 'submit',
    });
    expect(result.submission.status).toBe('Submitted');
  });

  it('saveBiodata throws without token', async () => {
    await expect(repo.saveBiodata({
      biodata: {},
      action: 'save',
    })).rejects.toThrow('Unauthorized');
  });
});
