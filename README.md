# Student Bio-Data & Records Management System
**Rauda College of Health Science and Technology, Kano**

A full-stack monorepo for managing student academic biodata — from registration through to reviewer approval and PDF generation.

---

## Repository Structure

```
/
├── client/         ← React + TypeScript + Tailwind CSS frontend  (see client/README.md)
├── server/         ← Flask REST API backend
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
- Mock API reference and Flask connection guide

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

Flask REST API — to be connected to the frontend by replacing the mock API layer in `client/src/api/api.ts`.

The frontend mock already uses the exact URL patterns the Flask API must implement. See the API route table in [client/README.md](./client/README.md).
