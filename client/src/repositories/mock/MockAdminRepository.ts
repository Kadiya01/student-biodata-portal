import { IAdminRepository } from '../IAdminRepository';
import { getDbUsers, getDbSubmissions, saveDbUsers, saveDbSubmissions, getDbNotifications, saveDbNotifications, User, Submission, NotificationItem } from '../../api/mockDb';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockAdminRepository implements IAdminRepository {
  async getSubmissions(): Promise<{ submissions: Submission[] }> {
    await delay(300);
    const submissions = getDbSubmissions();
    return { submissions };
  }

  async getSubmission(id: string): Promise<{ submission: Submission }> {
    await delay(200);
    const submissions = getDbSubmissions();
    const sub = submissions.find((s) => s.id === id);
    if (!sub) {
      const err: any = new Error('Not Found');
      err.response = { status: 404, data: { message: 'Submission not found' } };
      throw err;
    }
    return { submission: sub };
  }

  async reviewSubmission(id: string, status: string, reviewerComments: string): Promise<{ submission: Submission }> {
    await delay(400);
    const submissions = getDbSubmissions();
    const subIndex = submissions.findIndex((s) => s.id === id);

    if (subIndex === -1) {
      const err: any = new Error('Submission not found');
      err.response = { status: 404, data: { message: 'Submission not found' } };
      throw err;
    }

    const currentSub = submissions[subIndex];
    const updatedSub: Submission = {
      ...currentSub,
      status: status as Submission['status'],
      reviewerComments: reviewerComments || '',
    };

    submissions[subIndex] = updatedSub;
    saveDbSubmissions(submissions);

    const notifications = getDbNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Submission ${status}`,
      message: `Biodata for ${updatedSub.fullName} (${updatedSub.regNumber}) was ${status.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      read: false,
    });
    saveDbNotifications(notifications);

    return { submission: updatedSub };
  }

  async getReviewers(): Promise<{ reviewers: User[] }> {
    await delay(200);
    const users = getDbUsers();
    const reviewers = users.filter((u) => u.role === 'reviewer');
    return { reviewers };
  }

  async createReviewer(data: { firstName: string; lastName: string; email: string; password: string }): Promise<{ reviewer: User }> {
    await delay(400);
    const { firstName, lastName, email } = data;
    const users = getDbUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const err: any = new Error('Reviewer already exists');
      err.response = { status: 400, data: { message: 'Reviewer email already exists' } };
      throw err;
    }

    const newReviewer: User = {
      id: `u-reviewer-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: 'reviewer',
      status: 'active',
    };

    users.push(newReviewer);
    saveDbUsers(users);

    return { reviewer: newReviewer };
  }

  async updateReviewer(id: string, data: { firstName: string; lastName: string; email: string }): Promise<{ reviewer: User }> {
    await delay(300);
    const { firstName, lastName, email } = data;
    const users = getDbUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      const err: any = new Error('Reviewer not found');
      err.response = { status: 404, data: { message: 'Reviewer not found' } };
      throw err;
    }

    const updatedUser = {
      ...users[userIndex],
      firstName,
      lastName,
      email,
    };

    users[userIndex] = updatedUser;
    saveDbUsers(users);

    return { reviewer: updatedUser };
  }

  async toggleReviewer(id: string): Promise<{ reviewer: User }> {
    await delay(300);
    const users = getDbUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      const err: any = new Error('Reviewer not found');
      err.response = { status: 404, data: { message: 'Reviewer not found' } };
      throw err;
    }

    const reviewer = users[userIndex];
    reviewer.status = reviewer.status === 'active' ? 'inactive' : 'active';
    users[userIndex] = reviewer;
    saveDbUsers(users);

    return { reviewer };
  }

  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    await delay(200);
    const notifications = getDbNotifications();
    return { notifications };
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    await delay(200);
    const notifications = getDbNotifications();
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      saveDbNotifications(notifications);
    }
    return { success: true };
  }
}
