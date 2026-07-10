# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon account recommended)
- Render.com account (backend hosting)
- Vercel account (frontend hosting)
- Git repository on GitHub

---

## 1. Database Setup (Neon)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. The connection string format: `postgresql://user:pass@host/dbname?sslmode=require`

---

## 2. Backend Deployment (Render)

### 2.1 Environment Variables
Set these in the Render dashboard under Environment:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `DATABASE_POOL_SIZE` | Connection pool size (default: `20`) |
| `DATABASE_POOL_TIMEOUT` | Pool timeout in seconds (default: `30`) |
| `JWT_SECRET` | 64+ character random string. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CLIENT_URL` | Your Vercel frontend URL (e.g., `https://your-app.vercel.app`) |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `SMTP_HOST` | SMTP server host (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (default: `587`) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address (e.g., `noreply@yourdomain.com`) |
| `SMTP_FROM_NAME` | From name (e.g., `Student Portal`) |
| `REDIS_HOST` | Upstash Redis host (for BullMQ jobs + caching) |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `REDIS_PASSWORD` | Redis password |
| `SENTRY_DSN` | Sentry DSN for error monitoring (optional) |
| `CLOUDINARY_URL` | Cloudinary URL for file storage (optional) |

### 2.2 Deploy
1. Push code to GitHub
2. In Render, create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command:**
     ```
     cd server && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
     ```
   - **Start Command:**
     ```
     cd server && npm run start:prod
     ```
   - **Environment:** Node
   - **Region:** Frankfurt (eu-central-1) or closest to your users
5. Add environment variables
6. Deploy

The `render.yaml` in the root configures this automatically if you use Render's Blueprint feature.

### 2.3 Post-Deploy
After first deploy, run the seed script in the Render shell:
```bash
npx ts-node-dev --transpile-only prisma/seed.ts
```

This creates test accounts:
| Role | Email | Password |
|------|-------|----------|
| Student | student@college.edu.ng | password123 |
| Reviewer | reviewer@college.edu.ng | password123 |
| Super Admin | admin@college.edu.ng | password123 |

---

## 3. Frontend Deployment (Vercel)

### 3.1 Environment Variables
Set in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `/api/v1` (uses Vercel rewrites) |
| `VITE_USE_MOCK` | `false` |

### 3.2 Deploy
1. In Vercel, import the GitHub repository
2. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. The `vercel.json` in `/client` handles SPA rewrites and API proxying automatically
4. Deploy

### 3.3 Vercel Rewrites (vercel.json)
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-render-url.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
All `/api/*` requests are proxied to the Render backend.

---

## 4. Verification Checklist

After deployment, verify:

- [ ] Backend health check: `GET /api/v1/health` returns 200
- [ ] Student registration works (returns 201)
- [ ] Student login works (returns token + refreshToken)
- [ ] Refresh token rotation works (old token revoked, new one issued)
- [ ] Biodata wizard saves and submits
- [ ] Reviewer login and dashboard loads
- [ ] Approve/reject flow works
- [ ] Notifications appear on actions
- [ ] Audit log records events
- [ ] Password reset email sends (if SMTP configured)
- [ ] PDF download works
- [ ] Rate limiting blocks rapid requests (429 response)
- [ ] Mobile responsive layout

---

## 5. Docker (Alternative)

The server includes a multi-stage Dockerfile:

```bash
cd server
docker build -t student-biodata-api .
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e CLIENT_URL="https://your-frontend.vercel.app" \
  -e NODE_ENV=production \
  student-biodata-api
```

---

## 6. Local Development

### Backend
```powershell
cd server
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run dev
# Server runs at http://localhost:4000
```

### Frontend
```powershell
cd client
npm install
npm run dev
# Frontend runs at http://localhost:5173 (mock mode by default)
```

### Running Tests
```powershell
# Server tests (9 suites, 60 tests)
cd server
npm test

# Client tests (16 suites, 100 tests)
cd client
npm run test
```

### Full Stack
Start both in separate terminals. The Vite dev server proxies `/api` requests to the backend.
