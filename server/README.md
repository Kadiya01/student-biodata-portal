# Server — Student Bio-Data API

Express + TypeScript + Prisma backend for the Student Bio-Data & Records Management System.

## Quick Start

```powershell
cd server
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run dev
```

Server runs at **http://localhost:4000**

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | 32+ character random string for JWT signing |
| `CLIENT_URL` | No | Frontend URL for CORS (default: `http://localhost:5173`) |
| `NODE_ENV` | No | `development` or `production` (default: `development`) |
| `PORT` | No | Server port (default: `4000`) |
| `CLOUDINARY_URL` | No | Cloudinary connection string for file storage |
| `REDIS_HOST` | No | Redis host for background jobs (default: `127.0.0.1`) |
| `REDIS_PORT` | No | Redis port (default: `6379`) |
| `REDIS_PASSWORD` | No | Redis password (if required) |
| `REDIS_DB` | No | Redis database number (default: `0`) |
| `SENTRY_DSN` | No | Sentry DSN for error monitoring |
| `SMTP_HOST` | No | SMTP server host for email sending |
| `SMTP_PORT` | No | SMTP server port (default: `587`) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address for sent emails |
| `SMTP_FROM_NAME` | No | From name for sent emails |

Generate a JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |
| `npm test` | Run Jest tests |
| `npm run seed` | Seed database with test data |
| `npm run migrate` | Run Prisma migrations |
| `npm run start:prod` | Run migrations then start server (production) |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run lint` | Run ESLint |

## API Routes

| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | `/api/v1/auth/register` | No | - |
| POST | `/api/v1/auth/login` | No | - |
| POST | `/api/v1/auth/refresh` | No | - |
| POST | `/api/v1/auth/logout` | Yes | Any |
| GET | `/api/v1/auth/me` | Yes | Any |
| POST | `/api/v1/auth/forgot-password` | No | - |
| POST | `/api/v1/auth/reset-password` | No | - |
| GET | `/api/v1/students` | Yes | reviewer, super_admin |
| POST | `/api/v1/students` | Yes | student |
| GET | `/api/v1/students/:id` | Yes | Any |
| PUT | `/api/v1/students/approve/:id` | Yes | reviewer, super_admin |
| PUT | `/api/v1/students/reject/:id` | Yes | reviewer, super_admin |
| DELETE | `/api/v1/students/:id` | Yes | super_admin |
| GET | `/api/v1/students/:id/pdf` | Yes | Any |
| POST | `/api/v1/documents/upload` | Yes | Any |
| GET | `/api/v1/documents/:studentId` | Yes | Any |
| GET | `/api/v1/users` | Yes | reviewer, super_admin |
| PUT | `/api/v1/users/:id` | Yes | super_admin |
| PUT | `/api/v1/users/:id/toggle` | Yes | super_admin |
| GET | `/api/v1/notifications` | Yes | Any |
| PUT | `/api/v1/notifications/:id/read` | Yes | Any |
| PUT | `/api/v1/notifications/read-all` | Yes | Any |
| GET | `/api/v1/audit` | Yes | reviewer, super_admin |
| GET | `/api/v1/programmes` | Yes | Any |
| GET | `/api/v1/programmes/departments` | Yes | Any |
| POST | `/api/v1/programmes` | Yes | super_admin |
| GET | `/api/v1/health` | No | - |
| GET | `/metrics` | No | - |

## Background Jobs (BullMQ)

The server uses BullMQ with Redis for background job processing. Jobs are only initialized when `REDIS_HOST` is configured or in production mode.

### Available Queues

| Queue | Purpose |
|-------|---------|
| `email` | Send emails (forgot password, notifications) |
| `notifications` | Create in-app notifications |
| `pdf-generation` | Generate student biodata PDFs |
| `maintenance` | Document cleanup, audit log cleanup |

### Enqueueing Jobs

```typescript
import { sendEmailJob, sendNotificationJob, generatePdfJob } from './jobs';

// Send email
await sendEmailJob({
  to: 'user@example.com',
  subject: 'Password Reset',
  html: '<p>Click the link to reset...</p>',
});

// Create notification
await sendNotificationJob({
  userId: 'user-id',
  title: 'Submission Approved',
  message: 'Your biodata has been approved.',
  type: 'success',
});

// Generate PDF
await generatePdfJob({
  studentId: 'student-id',
  userId: 'user-id',
});
```

## Testing

```powershell
npm test
```

Tests use Jest + Supertest with mocked services. No database connection required.

## Docker

```powershell
docker build -t student-biodata-api .
docker run -p 4000:4000 -e DATABASE_URL="..." -e JWT_SECRET="..." student-biodata-api
```

## Project Structure

```
server/src/
├── config/
│   ├── index.ts              ← Environment configuration
│   ├── redis.ts              ← Redis connection config
│   └── sentry.ts             ← Sentry error monitoring
├── middleware/
│   ├── authMiddleware.ts     ← JWT auth + role guards
│   ├── catchAsync.ts         ← Async error wrapper
│   ├── errorHandler.ts       ← Global error handler
│   ├── requestLogger.ts      ← Structured logging
│   ├── sanitize.ts           ← XSS sanitization
│   └── validate.ts           ← Zod validation middleware
├── validation/               ← Zod schemas for request validation
├── controllers/              ← Request handlers
├── services/                 ← Business logic
├── jobs/
│   ├── queueManager.ts       ← BullMQ queue management
│   └── index.ts              ← Job definitions & processors
├── routes/                   ← Express route definitions
├── utils/
│   ├── jwt.ts                ← Token signing/verification
│   ├── logger.ts             ← Winston logger
│   └── regNumber.ts          ← Registration number generator
├── prismaClient.ts           ← Prisma singleton
└── app.ts                    ← Express app setup
```
