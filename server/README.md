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
| `DATABASE_POOL_SIZE` | No | Prisma connection pool size (default: `20`) |
| `DATABASE_POOL_TIMEOUT` | No | Pool timeout in seconds (default: `30`) |
| `CLOUDINARY_URL` | No | Cloudinary connection string for file storage |
| `REDIS_HOST` | No | Redis host for background jobs and caching |
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
| `npm run start:prod` | Run migrations then start server (production) |
| `npm test` | Run Jest tests (9 suites, 60 tests) |
| `npm run seed` | Seed database with test data |
| `npm run migrate` | Run Prisma migrations |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run lint` | Run ESLint |

## API Routes

| Method | Path | Auth | Role | Rate Limit |
|--------|------|------|------|------------|
| POST | `/api/v1/auth/register` | No | - | Global |
| POST | `/api/v1/auth/login` | No | - | Global |
| POST | `/api/v1/auth/refresh` | No | - | Auth (10/15min) |
| POST | `/api/v1/auth/logout` | Yes | Any | - |
| GET | `/api/v1/auth/me` | Yes | Any | Read |
| POST | `/api/v1/auth/forgot-password` | No | - | Global |
| POST | `/api/v1/auth/reset-password` | No | - | Global |
| GET | `/api/v1/students` | Yes | reviewer, super_admin | Read |
| POST | `/api/v1/students` | Yes | student | Write |
| GET | `/api/v1/students/:id` | Yes | Any | Read |
| PUT | `/api/v1/students/approve/:id` | Yes | reviewer, super_admin | Write |
| PUT | `/api/v1/students/reject/:id` | Yes | reviewer, super_admin | Write |
| DELETE | `/api/v1/students/:id` | Yes | super_admin | Write |
| GET | `/api/v1/students/:id/pdf` | Yes | Any | Read |
| POST | `/api/v1/documents/upload` | Yes | Any | Write |
| GET | `/api/v1/documents/:studentId` | Yes | Any | Read |
| GET | `/api/v1/users` | Yes | reviewer, super_admin | Read |
| PUT | `/api/v1/users/:id` | Yes | super_admin | Write |
| PUT | `/api/v1/users/:id/toggle` | Yes | super_admin | Write |
| GET | `/api/v1/notifications` | Yes | Any | Read |
| PUT | `/api/v1/notifications/:id/read` | Yes | Any | Write |
| PUT | `/api/v1/notifications/read-all` | Yes | Any | Write |
| GET | `/api/v1/audit` | Yes | reviewer, super_admin | Read |
| GET | `/api/v1/programmes` | Yes | Any | Read |
| GET | `/api/v1/programmes/departments` | Yes | Any | Read |
| POST | `/api/v1/programmes` | Yes | super_admin | Write |
| GET | `/api/v1/health` | No | - | - |
| GET | `/metrics` | Yes | super_admin | - |

## Security Features

- **Token Hashing:** Refresh tokens stored as SHA-256 hashes (never plaintext in DB)
- **TOCTOU-Safe Rotation:** Atomic `$transaction` with `updateMany({ revoked: false })` prevents double-use
- **Tiered Rate Limiting:** Per-user keying via JWT `userId`, falling back to IP
- **XSS Sanitization:** HTML entity decoding + tag/attribute/protocol stripping on all inputs
- **Cache Layer:** Redis caching with SCAN-based invalidation (no `KEYS` blocking)
- **Connection Pooling:** Configurable via `DATABASE_POOL_SIZE` and `DATABASE_POOL_TIMEOUT`

## Background Jobs (BullMQ)

BullMQ with Redis for background job processing. Gracefully degrades when Redis is unavailable.

| Queue | Purpose |
|-------|---------|
| `email` | Send emails (password reset, notifications) |
| `notifications` | Create in-app notifications |
| `pdf-generation` | Generate student biodata PDFs |
| `maintenance` | Document cleanup, audit log cleanup |

## Testing

```powershell
npm test
```

9 test suites, 60 tests using Jest + Supertest with mocked services. No database connection required.

| Suite | Tests | Description |
|-------|-------|-------------|
| auth | 3 | Registration, login, /me |
| security | 21 | Privilege escalation, IDOR, XSS, rate limiting, token security |
| students | 6 | CRUD, approve/reject |
| users | 6 | List, update, toggle |
| documents | 5 | Upload, list |
| audit | 5 | List, pagination |
| programmes | 8 | CRUD, departments |
| notifications | 4 | List, read |
| passwordReset | 8 | Forgot/reset flow |

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
│   ├── cache.ts              ← Redis cache (get/set/del with SCAN)
│   ├── cloudinary.ts         ← Cloudinary upload helpers
│   ├── redis.ts              ← Redis connection for BullMQ
│   └── sentry.ts             ← Sentry error monitoring
├── middleware/
│   ├── authMiddleware.ts     ← JWT auth + role guards
│   ├── catchAsync.ts         ← Async error wrapper + pagination
│   ├── errorHandler.ts       ← Global error handler (production masking)
│   ├── requestLogger.ts      ← Structured Winston logging
│   ├── sanitize.ts           ← XSS sanitization (HTML entity + tag stripping)
│   └── validate.ts           ← Zod validation middleware
├── validation/               ← Zod schemas for request validation
├── controllers/              ← Request handlers
├── services/                 ← Business logic (10 services)
├── jobs/
│   ├── queueManager.ts       ← BullMQ queue management (graceful Redis degradation)
│   └── index.ts              ← Job definitions & processors
├── routes/                   ← Express route definitions
├── utils/
│   ├── jwt.ts                ← Token signing/verification (HS256)
│   ├── logger.ts             ← Winston logger
│   └── regNumber.ts          ← Registration number generator
├── prismaClient.ts           ← Prisma singleton with connection pooling
├── app.ts                    ← Express app setup (rate limiting, CORS, Helmet)
└── index.ts                  ← Server entry point (graceful shutdown)
```

## Database

PostgreSQL via Prisma ORM. 10 tables:

| Table | Purpose |
|-------|---------|
| `Role` | User roles (student, reviewer, super_admin) |
| `User` | User accounts with hashed passwords |
| `Department` | Academic departments |
| `Programme` | Academic programmes within departments |
| `StudentProfile` | Student biodata (JSONB), status tracking |
| `NextOfKin` | Student emergency contacts |
| `Document` | Uploaded documents with Cloudinary/local URLs |
| `RefreshToken` | SHA-256 hashed refresh tokens with expiry |
| `PasswordResetToken` | Time-limited password reset tokens |
| `Notification` | In-app user notifications |
| `AuditLog` | Activity audit trail |
