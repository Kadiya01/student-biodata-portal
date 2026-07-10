# Student Bio-Data & Records Management System
**Rauda College of Health Science and Technology, Kano**

A full-stack monorepo for managing student academic biodata — from registration through to reviewer approval and PDF generation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion, React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL |
| Auth | JWT (HS256), bcrypt, refresh token rotation |
| Background Jobs | BullMQ + Redis (optional, degrades gracefully) |
| File Storage | Cloudinary (production), Multer (local fallback) |
| Email | Nodemailer SMTP (optional, falls back to logging) |
| Monitoring | Sentry error tracking, Winston structured logging |
| Testing | Jest + Supertest (server), Vitest (client) |
| Deployment | Render (backend), Vercel (frontend), Neon (PostgreSQL) |

---

## Repository Structure

```
/
├── client/         ← React + TypeScript + Tailwind CSS frontend  (see client/README.md)
├── server/         ← Express REST API backend                    (see server/README.md)
├── database/       ← SQL schema & seed files
├── docs/           ← API docs, deployment guide, SRS, architecture
├── scripts/        ← Utility and deployment scripts
└── render.yaml     ← Render deployment config
```

---

## Quick Start

### Full-Stack Local Setup

1. **Backend:**
```powershell
cd server
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npm run dev
# Server runs at http://localhost:4000
```

2. **Frontend (new terminal):**
```powershell
cd client
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

3. Open **http://localhost:5173/** in your browser.

> The frontend starts in **mock mode** by default (`VITE_USE_MOCK=true`), using fake data. Set `VITE_USE_MOCK=false` and ensure the backend is running for real API calls.

---

## User Roles

| Role | Description | Login |
|------|-------------|-------|
| **Student** | Registers, fills multi-step biodata wizard, tracks submission status, downloads PDF | `/login` |
| **Reviewer** | Reviews submissions, approves/rejects with comments, exports CSV/PDF | `/admin-login` |
| **Super Admin** | Manages reviewer accounts, views audit log, system metrics | `/admin-login` |

---

## Security Features

- **Passwords:** bcrypt hashed (10 rounds), never stored in plaintext
- **JWT:** HS256 pinned, 32-char minimum secret, 1-hour expiry
- **Refresh Tokens:** Rotation with TOCTOU-safe atomic revoke-and-issue, SHA-256 hashed at rest
- **Rate Limiting:** 3 tiers — global (200/15min), read (60/min), write (20/min), auth (10/15min)
- **Input Validation:** Zod schemas on all endpoints, XSS sanitization with HTML entity decoding
- **IDOR Protection:** Students forced to their own profile, reviewers/admins can set any userId
- **Privilege Escalation Prevention:** Registration restricted to `student` role only
- **Audit Logging:** Every significant action recorded with timestamp, user, and IP
- **Production Error Masking:** Internal errors hidden from client responses
- **CORS / Helmet / CSP:** Configured for production security

---

## Testing

### Server Tests (9 suites, 60 tests)
```powershell
cd server
npm test
```

| Suite | Tests | What it covers |
|-------|-------|----------------|
| auth | 3 | Registration, login, /me endpoint |
| security | 21 | Privilege escalation, IDOR, XSS, rate limiting, pagination, token security |
| students | 6 | CRUD, approve/reject, auth checks |
| users | 6 | List, update, toggle, auth checks |
| documents | 5 | Upload, list, auth checks |
| audit | 5 | List, pagination, auth checks |
| programmes | 8 | CRUD, departments, auth checks |
| notifications | 4 | List, read, read-all, auth checks |
| passwordReset | 8 | Forgot/reset password flow |

### Client Tests (16 suites, 100 tests)
```powershell
cd client
npm run test
```

---

## Deployment

See [docs/DEPLOY/README.md](./docs/DEPLOY/README.md) for the full deployment guide.

**TL;DR:**
1. Create a Neon PostgreSQL database
2. Push to GitHub — Render auto-deploys via `render.yaml`
3. Set environment variables in Render dashboard
4. Deploy frontend to Vercel
5. Run seed script: `npx ts-node-dev --transpile-only prisma/seed.ts`

---

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](./docs/API/README.md) | Full API endpoint documentation |
| [Deployment Guide](./docs/DEPLOY/README.md) | Step-by-step deployment instructions |
| [SRS](./docs/SRS/README.md) | Software Requirements Specification |
| [Architecture](./docs/ARCHITECTURE.md) | System architecture overview |
| [Server README](./server/README.md) | Backend setup, env vars, project structure |
| [Client README](./client/README.md) | Frontend setup, user flows, mock API |
