import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockAdminRepository } from '../mock/MockAdminRepository';

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
    { id: 'u-reviewer-1', email: 'reviewer@test.com', firstName: 'Test', lastName: 'Reviewer', role: 'reviewer', status: 'active' },
    { id: 'u-student-1', email: 'student@test.com', firstName: 'Test', lastName: 'Student', role: 'student', regNumber: 'RCHST-2026-00001' },
  ];
  const defaultSubmissions = [
    {
      id: 'sub-1',
      studentId: 'u-student-1',
      fullName: 'Test Student',
      regNumber: 'RCHST-2026-00001',
      status: 'Submitted',
      biodata: {},
      submissionDate: '2026-07-10T00:00:00Z',
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

describe('MockAdminRepository', () => {
  let repo: MockAdminRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    repo = new MockAdminRepository();
  });

  it('getSubmissions returns all submissions', async () => {
    const result = await repo.getSubmissions();
    expect(result.submissions).toBeDefined();
    expect(Array.isArray(result.submissions)).toBe(true);
    expect(result.submissions.length).toBeGreaterThan(0);
  });

  it('getSubmission returns a specific submission', async () => {
    const result = await repo.getSubmission('sub-1');
    expect(result.submission.id).toBe('sub-1');
    expect(result.submission.fullName).toBe('Test Student');
  });

  it('getSubmission throws for non-existent id', async () => {
    await expect(repo.getSubmission('nonexistent')).rejects.toThrow('Not Found');
  });

  it('reviewSubmission approves a submission', async () => {
    const result = await repo.reviewSubmission('sub-1', 'Approved', 'Looks good');
    expect(result.submission.status).toBe('Approved');
    expect(result.submission.reviewerComments).toBe('Looks good');
  });

  it('reviewSubmission throws for non-existent submission', async () => {
    await expect(repo.reviewSubmission('nonexistent', 'Approved', '')).rejects.toThrow('Submission not found');
  });

  it('getReviewers returns only reviewer users', async () => {
    const result = await repo.getReviewers();
    expect(result.reviewers).toBeDefined();
    expect(result.reviewers.every((r: any) => r.role === 'reviewer')).toBe(true);
  });

  it('createReviewer creates a new reviewer', async () => {
    const result = await repo.createReviewer({
      firstName: 'New',
      lastName: 'Reviewer',
      email: 'new@test.com',
      password: 'pass123',
    });
    expect(result.reviewer.email).toBe('new@test.com');
    expect(result.reviewer.role).toBe('reviewer');
  });

  it('createReviewer throws for duplicate email', async () => {
    await expect(repo.createReviewer({
      firstName: 'Dup',
      lastName: 'Reviewer',
      email: 'reviewer@test.com',
      password: 'pass123',
    })).rejects.toThrow('Reviewer already exists');
  });

  it('toggleReviewer toggles status', async () => {
    const result = await repo.toggleReviewer('u-reviewer-1');
    expect(result.reviewer.status).toBe('inactive');
  });

  it('toggleReviewer throws for non-existent reviewer', async () => {
    await expect(repo.toggleReviewer('nonexistent')).rejects.toThrow('Reviewer not found');
  });

  it('getNotifications returns notifications', async () => {
    const result = await repo.getNotifications();
    expect(result.notifications).toBeDefined();
    expect(Array.isArray(result.notifications)).toBe(true);
  });

  it('markNotificationRead marks notification as read', async () => {
    const result = await repo.markNotificationRead('nonexistent');
    expect(result.success).toBe(true);
  });
});
