# Student Bio-Data & Records Management System
**Rauda College of Health Science and Technology, Kano**

A full-stack monorepo for managing student academic biodata — from registration through to reviewer approval and PDF generation.

---

## Repository Structure

```
/
├── client/         ← React + TypeScript + Tailwind CSS frontend  (see client/README.md)
├── server/         ← Express REST API backend
├── database/       ← SQL schema & seed files
├── docs/           ← ERD, API docs, SRS
└── scripts/        ← Utility and deployment scripts
```

---

## Frontend (Client)

The complete student portal frontend. See **[client/README.md](./client/README.md)** for the full walkthrough including:

- Quick start instructions
- All page routes and user flows
- Test credentials for all three roles (Student, Reviewer, Super Admin)
- Mock API reference and real backend connection guide

**Quick start:**
```powershell
cd client
npm install
npm run dev
```
Portal runs at → **http://localhost:5173/**

---

## User Roles

| Role | Description |
|---|---|
| **Student** | Registers, fills multi-step biodata wizard, tracks submission status, downloads PDF |
| **Reviewer** | Reviews submissions, approves/rejects with comments, exports CSV/PDF |
| **Super Admin** | Monitors portal, manages reviewer accounts, views live alert log |

---

## Backend (Server)

Node.js + Express REST API.

The frontend mock already uses the same URL patterns the Express API implements. See the API route table in [client/README.md](./client/README.md).

**Run locally:**
```powershell
cd server
npm install
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, CLIENT_URL, and other env vars in server/.env
npm run dev
```

The backend listens on `http://localhost:4000` by default.

## Full-stack local setup

1. Start the backend:
```powershell
cd server
npm install
cp .env.example .env
npm run dev
```
2. Start the frontend:
```powershell
cd client
npm install
Set-Content .env "VITE_API_URL=http://localhost:4000/api/v1`nVITE_USE_MOCK=false"
npm run dev
```
3. Open the frontend at **http://localhost:5173/**.

If you want to keep mock mode, set `VITE_USE_MOCK=true` instead.
