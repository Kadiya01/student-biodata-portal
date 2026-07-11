import api from '../../api/api';
import { IAdminRepository } from '../IAdminRepository';
import { mapSubmission, toDbStatus } from '../../api/mappers';

export class ApiAdminRepository implements IAdminRepository {
  async getSubmissions(): Promise<{ submissions: any[] }> {
    const res = await api.get('/students');
    return { submissions: (res.data.students || []).map(mapSubmission) };
  }

  async getSubmission(id: string): Promise<{ submission: any }> {
    const res = await api.get(`/students/${id}`);
    return { submission: mapSubmission(res.data.student) };
  }

  async reviewSubmission(id: string, status: string, reviewerComments: string): Promise<{ submission: any }> {
    const lower = toDbStatus(status);
    if (lower === 'under_review') {
      const res = await api.put(`/students/under-review/${id}`, { reviewerComments });
      return { submission: mapSubmission(res.data.profile) };
    }
    if (lower === 'approved') {
      const res = await api.put(`/students/approve/${id}`, { reviewerComments });
      return { submission: mapSubmission(res.data.profile) };
    }
    const res = await api.put(`/students/reject/${id}`, { reviewerComments });
    return { submission: mapSubmission(res.data.profile) };
  }

  async getReviewers(): Promise<{ reviewers: any[] }> {
    const res = await api.get('/users?role=reviewer');
    return { reviewers: res.data.users };
  }

  async createReviewer(data: { firstName: string; lastName: string; email: string; password: string }): Promise<{ reviewer: any }> {
    const res = await api.post('/auth/register-admin', { ...data, role: 'reviewer' });
    return { reviewer: res.data.user };
  }

  async updateReviewer(id: string, data: { firstName: string; lastName: string; email: string }): Promise<{ reviewer: any }> {
    const res = await api.put(`/users/${id}`, data);
    return { reviewer: res.data.user };
  }

  async toggleReviewer(id: string): Promise<{ reviewer: any }> {
    const res = await api.put(`/users/${id}/toggle`);
    return { reviewer: res.data.user };
  }

  async getNotifications(): Promise<{ notifications: any[] }> {
    const res = await api.get('/notifications');
    const notifications = (res.data.notifications || []).map((n: any) => ({
      ...n,
      timestamp: n.createdAt || n.timestamp,
    }));
    return { notifications };
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    await api.put(`/notifications/${id}/read`);
    return { success: true };
  }
}
