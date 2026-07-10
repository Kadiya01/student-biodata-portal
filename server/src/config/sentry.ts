import * as Sentry from '@sentry/node';
import logger from '../utils/logger';

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.info('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    beforeSend(event) {
      if (event.exception) {
        logger.error('Sentry captured exception', {
          eventId: event.event_id,
        });
      }
      return event;
    },
  });

  logger.info('Sentry error monitoring initialized', {
    environment: process.env.NODE_ENV,
  });
}

export function captureException(error: Error, context?: Record<string, any>): string | undefined {
  if (!process.env.SENTRY_DSN) return undefined;

  return Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    return Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): string | undefined {
  if (!process.env.SENTRY_DSN) return undefined;

  return Sentry.captureMessage(message, level);
}

export { Sentry };
