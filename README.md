# Student Bio-Data & Records Management System
**Rauda College of Health Science and Technology, Kano**

A full-stack monorepo for managing student academic biodata — from registration through to reviewer approval, document upload, and PDF generation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion, React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL |
| Auth | JWT (HS256), bcrypt, refresh token rotation |
| Background Jobs | BullMQ + Redis (optional, degrades gracefully) |
| File Storage | Cloudinary (production), Multer memoryStorage (Render-compatible fallback) |
| Email | Nodemailer SMTP (optional, falls back to console logging) |
| Monitoring | Sentry error tracking, Winston structured logging |
| Testing | Jest + Supertest (server), Vitest (client) |
| Deployment | Render (backend), Vercel (frontend), Neon (PostgreSQL) |
| Agentic Browsing | `llms.txt`, `robots.txt` for AI-readable site metadata |

---

## Repository Structure

```
/
├── client/         ← React + TypeScript + Tailwind CSS frontend  (see client/README.md)
├── server/         ← Express REST API backend                    (see server/README.md)
├── database/       ← SQL schema & seed files
├── docs/           ← API docs, deployment guide, SRS, architecture
├── scripts/        ← Utility and deployment scripts
├── Dockerfile      ← Production container (node:18 + Prisma migrate)
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

### First-Time Bootstrap

On first startup, the server automatically:
- Creates roles (`student`, `reviewer`, `super_admin`)
- Creates a default super admin account (`admin@college.edu.ng` / `password123`)
- Seeds 4 departments and 7 programmes

Override the default admin with `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

---

## User Roles

| Role | Capabilities | Login |
|------|-------------|-------|
| **Student** | Register, fill multi-step biodata wizard, upload documents (PDF/JPEG/PNG/WebP ≤5MB), track submission status, download registration summary PDF, change password | `/login` |
| **Reviewer** | Review submissions, approve/reject with comments, mark as under-review, view student biodata details, export CSV, download server-generated PDF per student | `/admin-login` |
| **Super Admin** | All reviewer capabilities + manage reviewer accounts, manage programmes (add/edit), view audit log, view/manage notifications (mark-all-read), change password | `/admin-login` |

---

## Key Features

### Student Portal
- Multi-step biodata wizard with validation at every step
- Live credit check calculation (English, Maths, minimum 5 subjects)
- Document upload to Cloudinary (or filename fallback on local dev)
- Submission status tracking with reviewer comments
- Forgot/reset password flow (dev mode returns reset link in response)
- Change password (authenticated)

### Staff Dashboard
- Submissions table with pagination (20 per page)
- Approve / Reject / Mark Under-Review with comment threads
- Programme management (add/edit modal)
- Audit log viewer with filters (user, action, date range)
- Notification system with mark-all-read
- Server-side PDF download per student (no client-side generation needed)
- Bulk CSV/PDF export for all submissions
- Change password (authenticated)

### Security
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
- **Graceful Degradation:** Redis/BullMQ/Sentry/Cloudinary all degrade gracefully when unavailable

### Performance
- Code splitting via `React.lazy` — main bundle ~337KB, page chunks loaded on demand
- Non-blocking Google Fonts (preload + onload swap)
- Tailwind CSS purging for minimal CSS output

---

## Testing

### Server Tests (9 suites)
```powershell
cd server
npm test
```

| Suite | What it covers |
|-------|----------------|
| auth | Registration, login, /me endpoint |
| security | Privilege escalation, IDOR, XSS, rate limiting, pagination, token security |
| students | CRUD, approve/reject, auth checks |
| users | List, update, toggle, auth checks |
| documents | Upload, list, auth checks |
| audit | List, pagination, auth checks |
| programmes | CRUD, departments, auth checks |
| notifications | List, read, read-all, auth checks |
| passwordReset | Forgot/reset password flow |

### Client Tests
```powershell
cd client
npm run test
```

Mock repository tests for `StudentRepository`, `AdminRepository`, and `AuthRepository`.

---

## Deployment

See [docs/DEPLOY/README.md](./docs/DEPLOY/README.md) for the full deployment guide.

**TL;DR:**
1. Create a Neon PostgreSQL database
2. Push to GitHub — Render auto-deploys via `render.yaml`
3. Set environment variables in Render dashboard:
   - `DATABASE_URL` — Neon connection string (with `?sslmode=require`)
   - `JWT_SECRET` — 64-char hex string
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — optional, overrides default super admin
   - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` — optional, enables email notifications
4. Deploy frontend to Vercel with env var `VITE_USE_MOCK=false`
5. Server auto-bootstraps on first startup (roles, admin, departments, programmes)

**Default Credentials (dev/bootstrap):**
| Email | Password | Role |
|-------|----------|------|
| `admin@college.edu.ng` | `password123` | Super Admin |
| `reviewer@college.edu.ng` | `password123` | Reviewer |
| `student@college.edu.ng` | `password123` | Student |

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
