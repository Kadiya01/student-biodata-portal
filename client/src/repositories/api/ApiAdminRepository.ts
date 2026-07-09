import axios from 'axios';
import { IAdminRepository } from '../IAdminRepository';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api/v1',
});

function setAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export class ApiAdminRepository implements IAdminRepository {
  async getSubmissions(): Promise<{ submissions: any[] }> {
    setAuth();
    const res = await api.get('/students');
    return { submissions: res.data.students };
  }

  async getSubmission(id: string): Promise<{ submission: any }> {
    setAuth();
    const res = await api.get(`/students/${id}`);
    return { submission: res.data.student };
  }

  async reviewSubmission(id: string, status: string, reviewerComments: string): Promise<{ submission: any }> {
    setAuth();
    if (status === 'approved') {
      const res = await api.put(`/students/approve/${id}`, { reviewerComments });
      return { submission: res.data.profile };
    }
    const res = await api.put(`/students/reject/${id}`, { reviewerComments });
    return { submission: res.data.profile };
  }

  async getReviewers(): Promise<{ reviewers: any[] }> {
    setAuth();
    const res = await api.get('/users?role=reviewer');
    return { reviewers: res.data.users };
  }

  async createReviewer(data: { firstName: string; lastName: string; email: string; password: string }): Promise<{ reviewer: any }> {
    setAuth();
    const res = await api.post('/auth/register', { ...data, role: 'reviewer' });
    return { reviewer: res.data.user };
  }

  async updateReviewer(id: string, data: { firstName: string; lastName: string; email: string }): Promise<{ reviewer: any }> {
    setAuth();
    const res = await api.put(`/users/${id}`, data);
    return { reviewer: res.data.user };
  }

  async toggleReviewer(id: string): Promise<{ reviewer: any }> {
    setAuth();
    const res = await api.put(`/users/${id}/toggle`);
    return { reviewer: res.data.user };
  }

  async getNotifications(): Promise<{ notifications: any[] }> {
    setAuth();
    const res = await api.get('/notifications');
    return { notifications: res.data.notifications || [] };
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    setAuth();
    const res = await api.put(`/notifications/${id}/read`);
    return { success: true };
  }
}
