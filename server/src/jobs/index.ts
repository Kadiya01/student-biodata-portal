import { Job } from 'bullmq';
import { queueManager } from './queueManager';
import logger from '../utils/logger';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface PdfGenerationJobData {
  studentId: string;
  userId: string;
  outputPath?: string;
}

export interface DocumentCleanupJobData {
  olderThanDays: number;
  dryRun?: boolean;
}

export interface AuditCleanupJobData {
  olderThanDays: number;
  dryRun?: boolean;
}

const EMAIL_QUEUE = 'email';
const NOTIFICATION_QUEUE = 'notifications';
const PDF_QUEUE = 'pdf-generation';
const MAINTENANCE_QUEUE = 'maintenance';

export function initializeJobQueues(): void {
  queueManager.createWorker(EMAIL_QUEUE, async (job: Job) => {
    const { to, subject, html } = job.data as EmailJobData;
    logger.info(`[Email] Sending email to ${to}: ${subject}`);
    // TODO: Integrate with email provider (SMTP, SendGrid, Mailgun, etc.)
    logger.info(`[Email] Would send email`, { to, subject, html: html.substring(0, 100) });
    return { sent: true, to, subject };
  });

  queueManager.createWorker(NOTIFICATION_QUEUE, async (job: Job) => {
    const { userId, title, message, type } = job.data as NotificationJobData;
    logger.info(`[Notification] Creating notification for user ${userId}`, { title, type });
    // TODO: Insert into Notification table via Prisma
    return { created: true, userId, title, type };
  });

  queueManager.createWorker(PDF_QUEUE, async (job: Job) => {
    const { studentId, userId, outputPath } = job.data as PdfGenerationJobData;
    logger.info(`[PDF] Generating PDF for student ${studentId}`, { userId, outputPath });

    const { buildStudentPdf } = await import('../services/pdfService');
    const buffer = await buildStudentPdf(studentId);

    logger.info(`[PDF] PDF generated successfully for student ${studentId}`, {
      size: buffer.length,
    });
    return { studentId, size: buffer.length, generatedAt: new Date().toISOString() };
  });

  queueManager.createWorker(MAINTENANCE_QUEUE, async (job: Job) => {
    const { olderThanDays, dryRun } = job.data as DocumentCleanupJobData;
    logger.info(`[Maintenance] Cleaning up documents older than ${olderThanDays} days`, { dryRun });
    // TODO: Implement document cleanup logic with Prisma
    return { cleaned: 0, olderThanDays, dryRun };
  });

  queueManager.createQueueEvents(EMAIL_QUEUE);
  queueManager.createQueueEvents(NOTIFICATION_QUEUE);
  queueManager.createQueueEvents(PDF_QUEUE);
  queueManager.createQueueEvents(MAINTENANCE_QUEUE);

  logger.info('All job queues initialized');
}

export async function sendEmailJob(data: EmailJobData): Promise<void> {
  await queueManager.addJob(EMAIL_QUEUE, 'send-email', data);
}

export async function sendNotificationJob(data: NotificationJobData): Promise<void> {
  await queueManager.addJob(NOTIFICATION_QUEUE, 'create-notification', data);
}

export async function generatePdfJob(data: PdfGenerationJobData): Promise<void> {
  await queueManager.addJob(PDF_QUEUE, 'generate-pdf', data);
}

export async function scheduleDocumentCleanup(olderThanDays: number, dryRun = false): Promise<void> {
  await queueManager.addJob(MAINTENANCE_QUEUE, 'document-cleanup', { olderThanDays, dryRun }, {
    repeat: { pattern: '0 2 * * 0' },
  });
}

export async function scheduleAuditCleanup(olderThanDays: number, dryRun = false): Promise<void> {
  await queueManager.addJob(MAINTENANCE_QUEUE, 'audit-cleanup', { olderThanDays, dryRun }, {
    repeat: { pattern: '0 3 * * 0' },
  });
}
