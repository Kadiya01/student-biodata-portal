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
| `JWT_SECRET` | 64+ character random string. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CLIENT_URL` | Your Vercel frontend URL (e.g., `https://your-app.vercel.app`) |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |

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
     cd server && node dist/src/index.js
     ```
   - **Environment:** Node
   - **Region:** Frankfurt (eu-central-1)
5. Add environment variables
6. Deploy

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
    { "source": "/api/:path*", "destination": "https://student-biodata-api.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
All `/api/*` requests are proxied to the Render backend.

---

## 4. Verification Checklist

After deployment, verify:

- [ ] Backend health check: `GET /api/v1/health` returns 200
- [ ] Student registration works
- [ ] Student login works
- [ ] Biodata wizard saves and submits
- [ ] Reviewer login and dashboard loads
- [ ] Approve/reject flow works
- [ ] Notifications appear on actions
- [ ] Audit log records events
- [ ] CSV/PDF export works
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
# Create .env with VITE_API_URL and VITE_USE_MOCK
npm run dev
# Frontend runs at http://localhost:5173
```

### Full Stack
Start both in separate terminals. The Vite dev server proxies `/api` requests to the backend.
