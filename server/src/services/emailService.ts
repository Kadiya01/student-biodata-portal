import nodemailer from 'nodemailer';
import logger from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || 'Student Bio-Data Portal';
  const fromEmail = process.env.SMTP_FROM || 'noreply@studentbiodata.app';

  if (!host || !user || !pass) {
    logger.warn('SMTP not configured. Emails will be logged instead of sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  logger.info('SMTP transporter initialized', { host, port, from: fromEmail });
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const t = getTransporter();

  if (!t) {
    logger.info('[Email] SMTP not configured — logging email', {
      to: options.to,
      subject: options.subject,
      html: options.html.substring(0, 200),
    });
    return;
  }

  const fromName = process.env.SMTP_FROM_NAME || 'Student Bio-Data Portal';
  const fromEmail = process.env.SMTP_FROM || 'noreply@studentbiodata.app';

  try {
    const info = await t.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    logger.info('[Email] Sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });
  } catch (err) {
    logger.error('[Email] Failed to send', {
      to: options.to,
      subject: options.subject,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  await sendEmail({
    to,
    subject: 'Password Reset — Student Bio-Data Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="
            background-color: #1a237e;
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
          ">Reset Password</a>
        </p>
        <p>Or copy this link into your browser:</p>
        <p style="font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <hr style="margin: 24px 0;" />
        <p style="font-size: 12px; color: #666;">
          This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `.trim(),
  });
}
