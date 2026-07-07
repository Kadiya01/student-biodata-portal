import { Submission, User, NotificationItem } from '../api/mockDb';

export interface IAdminRepository {
  getSubmissions(): Promise<{ submissions: Submission[] }>;
  getSubmission(id: string): Promise<{ submission: Submission }>;
  reviewSubmission(id: string, status: string, reviewerComments: string): Promise<{ submission: Submission }>;
  getReviewers(): Promise<{ reviewers: User[] }>;
  createReviewer(data: { firstName: string; lastName: string; email: string; password: string }): Promise<{ reviewer: User }>;
  updateReviewer(id: string, data: { firstName: string; lastName: string; email: string }): Promise<{ reviewer: User }>;
  toggleReviewer(id: string): Promise<{ reviewer: User }>;
  getNotifications(): Promise<{ notifications: NotificationItem[] }>;
  markNotificationRead(id: string): Promise<{ success: boolean }>;
}
