# Student Bio-Data & Records Management System — Architecture

## Overview

This document captures the high-level architecture for the Student Bio-Data & Records Management System built for Rauda College of Health Science and Technology Kano. It describes components, data flow, API surface, deployment targets, security considerations, and next steps for Milestone 1.

## High-level Components

- **Client (Frontend)**: React + Vite + TypeScript + Tailwind CSS. Hosts public pages, student dashboard, and admin dashboard. Deployed to Vercel.
- **API Server (Backend)**: Node.js + Express + TypeScript. Implements REST APIs, authentication, file handling, PDF generation, and audit logging. Deployed to Render.
- **Database**: PostgreSQL (Neon recommended) accessed through Prisma ORM. Schema defined in `server/prisma/schema.prisma`.
- **File Storage**: Cloudinary (primary) with a local-storage fallback for development.
- **Auth**: JWT (access tokens) and `bcrypt` for password hashing.
- **PDF Generation**: `pdfkit` (server-side) or `react-pdf` (client-side export) as needed.
- **Logging & Monitoring**: Winston for structured logs; Audit logs recorded in DB. Optional Sentry for errors and Prometheus/Grafana for metrics.

## API Surface (subset)

- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login, returns JWT
- `GET  /api/v1/auth/me` — Current user
- `GET  /api/v1/students` — List/search students (admin)
- `POST /api/v1/students` — Create student profile (student)
- `PUT  /api/v1/students/:id` — Update profile
- `DELETE /api/v1/students/:id` — Remove profile (admin)
- `POST /api/v1/documents/upload` — Upload file (multipart)
- `GET  /api/v1/documents/:studentId` — List student documents
- `PUT  /api/v1/students/approve/:id` — Approve student (admin/registrar)
- `PUT  /api/v1/students/reject/:id` — Reject student (admin/registrar)

Authentication-protected endpoints must require `Authorization: Bearer <token>`.

## Data Flow (examples)

1. User registers → backend creates `User` with `passwordHash`, assigns `Role`, returns JWT.
2. Student completes biodata → backend writes `StudentProfile` and attaches uploaded `Document` records.
3. Registrar reviews application → updates `StudentProfile.status` to `approved` or `rejected` and a record is inserted into `AuditLog`.

## Database & Prisma

- Use the existing Prisma schema at `server/prisma/schema.prisma` which includes `User`, `Role`, `StudentProfile`, `Department`, `Programme`, `Document`, `NextOfKin`, and `AuditLog` models.
- Ensure appropriate indexes on frequently queried fields (e.g., `email`, `studentNumber`, `programmeId`, `status`).

## Security Considerations

- Store secrets in environment variables (see `server/src/config/index.ts`).
- Use HTTPS in production and enforce secure cookies if using refresh tokens.
- Validate and sanitize all input (body, params, query) — use a validation library (Zod or Joi).
- Enforce file-type and size limits on uploads and scan for dangerous content where possible.
- Short-lived access tokens; consider refresh tokens for long sessions.

## Scalability & Reliability

- Keep backend stateless; persist sessions via JWT and user state in DB.
- Offload file serving to Cloudinary or CDN.
- Use connection pooling for Postgres; monitor connections and slow queries.
- Consider background jobs (BullMQ or similar) for heavy tasks (PDF generation, large imports).

## Observability

- Structured logging with Winston; write important events to `AuditLog` table.
- Expose health endpoint (`/api/v1/health`) for liveness/readiness checks.

## Deployment Topology

- Frontend: Vercel (build from `/client` output)
- Backend: Render (Docker or Node service), environment variables configured in Render dashboard
- Database: Neon Postgres (managed)
- Storage: Cloudinary

## Next Steps (Milestone 1 → Milestone 2)

1. Finalize DB schema SQL export and seeds (`/database/`).
2. Generate backend skeleton (routes, controllers, services) consistent with API surface.
3. Add validation, error middleware, and central logging.
4. Implement auth flows (register/login/me) and unit tests for auth.

---

File references:

- Prisma schema: [server/prisma/schema.prisma](server/prisma/schema.prisma)
- Server entry: [server/src/index.ts](server/src/index.ts)

Prepared by AI engineering assistant — ready to proceed with database schema generation.
