import { Submission, User, NotificationItem } from '../api/mockDb';

export interface Programme {
  id: string;
  name: string;
  code: string;
  departmentId?: string;
  durationMonths?: number;
  department?: { id: string; name: string; code: string };
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  user?: { id: string; firstName?: string; lastName?: string; email: string };
}

export interface IAdminRepository {
  getSubmissions(): Promise<{ submissions: Submission[] }>;
  getSubmission(id: string): Promise<{ submission: Submission }>;
  reviewSubmission(id: string, status: string, reviewerComments: string): Promise<{ submission: Submission }>;
  deleteStudent(id: string): Promise<{ success: boolean }>;
  downloadPdf(studentId: string): Promise<Blob>;
  getReviewers(): Promise<{ reviewers: User[] }>;
  createReviewer(data: { firstName: string; lastName: string; email: string; password: string }): Promise<{ reviewer: User }>;
  updateReviewer(id: string, data: { firstName: string; lastName: string; email: string }): Promise<{ reviewer: User }>;
  toggleReviewer(id: string): Promise<{ reviewer: User }>;
  getNotifications(): Promise<{ notifications: NotificationItem[] }>;
  markNotificationRead(id: string): Promise<{ success: boolean }>;
  markAllNotificationsRead(): Promise<{ success: boolean }>;
  getProgrammes(): Promise<{ programmes: Programme[] }>;
  getDepartments(): Promise<{ departments: Department[] }>;
  createProgramme(data: { name: string; code: string; departmentId?: string; durationMonths?: number }): Promise<{ programme: Programme }>;
  updateProgramme(id: string, data: Partial<{ name: string; code: string; departmentId: string; durationMonths: number }>): Promise<{ programme: Programme }>;
  deleteProgramme(id: string): Promise<{ success: boolean }>;
  getAuditLogs(params?: { limit?: number; offset?: number; action?: string; entityType?: string }): Promise<{ logs: AuditLogEntry[]; total: number }>;
}
