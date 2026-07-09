# Student Biodata Portal — Frontend
**Rauda College of Health Science and Technology**

> Built with React + TypeScript + Tailwind CSS + Framer Motion

---

## Quick Start

```powershell
cd client
npm install
npm run dev
```

Dev server starts at **http://localhost:5173/**

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling with custom brand tokens |
| Framer Motion | Page transitions, modal animations, step indicators |
| React Router v6 | Role-based client-side routing |
| React Hook Form | Form state management |
| Zod | Schema validation |
| Lucide React | Icon library |
| Axios | HTTP client (mock-overridden for offline dev) |

---

## Project Structure

```
client/src/
├── api/
│   ├── api.ts              ← Mock API layer (Axios override → LocalStorage)
│   └── mockDb.ts           ← LocalStorage mock database with seed data
├── components/
│   ├── layout/
│   │   └── SidebarLayout.tsx       ← Responsive sidebar + top navbar shell
│   └── ui/
│       ├── Badge.tsx               ← Status indicator badges
│       ├── Button.tsx              ← Multi-variant button with loading state
│       ├── Card.tsx                ← Card, Header, Content, Footer
│       ├── EmptyState.tsx          ← Empty list placeholder
│       ├── FileUpload.tsx          ← Drag-and-drop photo uploader (Base64)
│       ├── Input.tsx               ← Accessible, validated input (forwarded ref)
│       ├── Modal.tsx               ← Animated overlay modal (portal)
│       ├── ProgressBar.tsx         ← Progress percentage indicator
│       ├── Select.tsx              ← Styled dropdown (forwarded ref)
│       ├── Skeleton.tsx            ← Loading placeholder
│       └── Stepper.tsx             ← Multi-step wizard tracker
├── context/
│   ├── AuthContext.tsx             ← Auth state: user, role, login, register, logout
│   └── ToastContext.tsx            ← App-wide toast notification system
├── pages/
│   ├── Landing.tsx                 ← Hero section + dual portal cards
│   ├── Login.tsx                   ← Student portal login
│   ├── Register.tsx                ← Student registration + receipt screen
│   ├── AdminLogin.tsx              ← Staff / Admin portal login
│   ├── StudentDashboard.tsx        ← Student overview + contextual action panels
│   ├── BiodataWizard.tsx           ← 4-step form wizard with live credit counter
│   ├── SubmissionStatus.tsx        ← Animated status timeline + PDF actions
│   └── AdminDashboard.tsx          ← Reviewer + Super Admin combined dashboard
└── routes/
    └── AppRoutes.tsx               ← Full role-based routing with ProtectedRoute
```

---

## User Roles & Access

| Role | Login Page | Dashboard Route |
|---|---|---|
| **Student** | `/login` | `/student` |
| **Reviewer** | `/admin-login` | `/admin` |
| **Super Admin** | `/admin-login` | `/admin` |

The backend determines whether an admin user is a Reviewer or Super Admin. The frontend adapts the dashboard automatically based on the `role` field returned from `/auth/me`.

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Student | `student@college.edu.ng` | `password123` |
| Reviewer | `reviewer@college.edu.ng` | `password123` |
| Super Admin | `admin@college.edu.ng` | `password123` |

> Mock mode accepts any password. Production mode requires the passwords listed above.

---

## User Flow Walkthroughs

### Student — Register New Account
1. Go to **http://localhost:5173/**
2. Click **Register Account** on the Student Portal card
3. Fill in Full Name, Email, Phone, Password, Confirm Password
4. Click **Register Account**
5. ✅ Success screen displays a generated `RCHST-2026-XXXXX` registration number with a copy button
6. Click **Proceed to Student Login**

### Student — Complete Biodata Wizard
1. Log in → lands on `/student` dashboard
2. Click **Start Wizard Form**
3. **Step 1 – Personal Info:** Upload passport photo (drag-and-drop or click), fill name, DOB, gender, email, phone, address → Next
4. **Step 2 – Educational Info:**
   - Enter primary and secondary schools, select SSCE exam body (WAEC/NECO/NABTEB)
   - English Language and Mathematics rows are locked (always first)
   - Click **Add Subject** to add more rows from the dropdown
   - 🔢 **Live credit counter** updates as grades are selected
   - ✅/❌ **Eligibility indicator** turns green only when: English ≥ C6 AND Maths ≥ C6 AND total credits ≥ 5
   - The **Next** button is disabled until eligible
5. **Step 3 – Guardian Info:** Enter guardian name, phone, relationship, address → Next
6. **Step 4 – Review:** Full summary of all steps before final submission
7. Click **Submit Biodata Form** → Success receipt card with reg number, name, date, status, and Download/Print buttons

### Student — Check Submission Status
- Sidebar → **Submission Status** → `/student/status`
- Visual animated timeline: **Draft → Submitted → Under Review → Approved / Rejected**
- If **Rejected**: Reviewer comment shown in a red alert box with an **Edit Biodata Form** button
- If **Approved**: Green panel with **Print Summary** and **Download PDF** buttons

### Reviewer — Review & Process Submissions
1. Log in at `/admin-login` with reviewer credentials
2. Reviewer Dashboard: 4 stat cards + searchable submission table
3. Click **View Details** on any student row to open the review modal
4. Modal shows: passport photo, all personal/educational/guardian data, and full SSCE table with credit count
5. Enter a comment → click **Approve & Clear Student** or **Reject Submission**
6. Toast notification confirms the action; table refreshes automatically
7. **Export CSV** — downloads `.csv` of all currently visible (filtered) records
8. **Export PDF Booklet** — downloads `.pdf` booklet of all visible records

### Super Admin — Manage Reviewers & Monitor
1. Log in at `/admin-login` with admin credentials
2. Dashboard shows system-wide stat cards + two panels:
   - **Reviewers Account Registry** — lists all reviewer accounts with Edit and Deactivate/Activate toggles
   - **Live Alerts Log** — real-time audit log of student registrations and submission events
3. Click **Add Reviewer Account** → modal to create new reviewer (name, email, password)

---

## Branding & Design System

| Token | Value |
|---|---|
| Primary | `#0F766E` (Deep Teal) |
| Secondary | `#14B8A6` (Aqua) |
| Accent | `#F59E0B` (Amber — used for admin/staff) |
| Background | `#F8FAFC` (Soft Slate) |
| Font | Inter, Outfit (Google Fonts) |

Custom Tailwind tokens are defined in `tailwind.config.cjs` under `theme.extend.colors.brand`.

---

## Mock API — How It Works

The `client/src/api/api.ts` file overrides Axios's `get`, `post`, and `put` methods to intercept all API calls and resolve them against the LocalStorage mock database (`mockDb.ts`) with a simulated 400–500ms delay.

All API routes follow the same URL patterns that the real Flask backend will expose:

| Method | URL | Description |
|---|---|---|
| POST | `/auth/login` | Login (returns token + user) |
| POST | `/auth/register` | Register student |
| GET | `/auth/me` | Get current user from token |
| GET | `/student/biodata` | Get student's draft/submission |
| POST | `/student/biodata` | Save draft or submit biodata |
| GET | `/reviewer/submissions` | List all submissions |
| GET | `/reviewer/submissions/:id` | Get single submission |
| POST | `/reviewer/submissions/:id/review` | Approve or reject |
| GET | `/admin/reviewers` | List reviewer accounts |
| POST | `/admin/reviewers` | Create reviewer |
| PUT | `/admin/reviewers/:id` | Edit reviewer |
| POST | `/admin/reviewers/:id/toggle` | Activate / deactivate |
| GET | `/admin/notifications` | Get alert log |

---

## Connecting to the Real Flask Backend

When the Flask API is ready:

1. **Delete** the `api.get = async function...`, `api.post = async function...`, and `api.put = async function...` override blocks in [`src/api/api.ts`](./src/api/api.ts)
2. Create a `.env` file in the `client/` directory:
   ```
   VITE_API_URL=http://localhost:5000/api/v1
   ```
3. The Axios instance will take over automatically — no changes needed to any pages or components.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Base URL for the Flask REST API |

---

## Build for Production

```powershell
npm run build
```

Output is written to `client/dist/`. Serve via any static file host or configure Nginx/Flask to serve `dist/index.html` for all routes.
