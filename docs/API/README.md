# API Documentation — Student Bio-Data System

**Base URL:** `https://student-biodata-api.onrender.com/api/v1` (production) or `http://localhost:4000/api/v1` (development)

**Authentication:** All protected endpoints require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

**Content-Type:** `application/json` for all requests except file uploads.

---

## Auth Routes

### POST `/auth/register`
Register a new student account.

**Body:**
```json
{
  "email": "student@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "08012345678"
}
```

**Response (200):**
```json
{
  "user": { "id": "...", "email": "...", "role": "student", "regNumber": "RCHST-2026-00001" },
  "token": "eyJ...",
  "regNumber": "RCHST-2026-00001"
}
```

**Validation:** Password must be 8+ chars with at least one uppercase letter and one number.

---

### POST `/auth/login`
Login with email and password.

**Body:** `{ "email": "...", "password": "..." }`

**Response (200):** `{ "user": {...}, "token": "eyJ..." }`

**Rate Limit:** 10 attempts per 15 minutes.

---

### GET `/auth/me`
Get the currently authenticated user.

**Auth Required:** Yes

**Response (200):** `{ "user": { "id", "email", "role", "firstName", "lastName", "regNumber" } }`

---

### POST `/auth/forgot-password`
Request a password reset token.

**Body:** `{ "email": "user@example.com" }`

**Response (200):** `{ "message": "If an account exists, a reset link has been generated." }`

---

### POST `/auth/reset-password`
Reset password with a valid token.

**Body:** `{ "token": "...", "password": "NewPassword123" }`

**Response (200):** `{ "message": "Password reset successful" }`

**Error (500):** `{ "error": "Invalid or expired token" }`

---

## Student Routes

### GET `/students`
List all students. **Reviewer/Super Admin only.**

**Query Params:** `search`, `status`, `limit` (default 50), `offset` (default 0)

**Response (200):**
```json
{
  "students": [...],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

---

### POST `/students`
Create or update a student profile. **Student only.**

**Body:** Biodata JSON with fields from the wizard (step1, step2, step3 merged).

**Response (200):** `{ "profile": {...} }`

---

### GET `/students/:id`
Get a student profile by ID.

**Response (200):** `{ "student": {...} }`

---

### PUT `/students/approve/:id`
Approve a student submission. **Reviewer/Super Admin only.**

**Body:** `{ "reviewerComments": "Approved" }`

**Response (200):** `{ "profile": {...} }`

---

### PUT `/students/reject/:id`
Reject a student submission. **Reviewer/Super Admin only.**

**Body:** `{ "reviewerComments": "Missing documents" }`

**Response (200):** `{ "profile": {...} }`

---

### DELETE `/students/:id`
Delete a student profile. **Super Admin only.**

**Response (200):** `{ "success": true }`

---

## Document Routes

### POST `/documents/upload`
Upload a document (multipart/form-data).

**Fields:** `file` (file), `studentId` (UUID string)

**File Limits:** 5MB max, allowed types: JPEG, PNG, WebP, PDF, DOC, DOCX

**Response (200):** `{ "doc": {...} }`

---

### GET `/documents/:studentId`
List documents for a student.

**Response (200):** `{ "docs": [...] }`

---

## User Routes (Super Admin)

### GET `/users`
List all users. **Reviewer/Super Admin.**

**Query Params:** `role` (optional filter)

**Response (200):** `{ "users": [...] }`

---

### PUT `/users/:id`
Update a user. **Super Admin only.**

**Body:** `{ "firstName": "...", "lastName": "...", "email": "..." }`

**Response (200):** `{ "user": {...} }`

---

### PUT `/users/:id/toggle`
Toggle user active/inactive status. **Super Admin only.**

**Response (200):** `{ "user": {...} }`

---

## Notification Routes

### GET `/notifications`
List notifications for the current user.

**Response (200):** `{ "notifications": [...] }`

---

### PUT `/notifications/:id/read`
Mark a notification as read.

**Response (200):** `{ "success": true }`

---

### PUT `/notifications/read-all`
Mark all notifications as read.

**Response (200):** `{ "success": true }`

---

## Audit Routes

### GET `/audit`
List audit logs. **Reviewer/Super Admin.**

**Query Params:** `limit` (default 50), `offset` (default 0), `userId`, `action`, `entityType`

**Response (200):** `{ "logs": [...] }`

---

## Programme Routes

### GET `/programmes`
List all programmes.

**Query Params:** `departmentId` (optional filter)

**Response (200):** `{ "programmes": [...] }`

---

### GET `/programmes/departments`
List all departments.

**Response (200):** `{ "departments": [...] }`

---

### GET `/programmes/:id`
Get a single programme by ID.

**Response (200):** `{ "programme": {...} }`

---

### POST `/programmes`
Create a programme. **Super Admin only.**

**Body:** `{ "name": "...", "code": "...", "departmentId": "...", "durationMonths": 48 }`

**Response (201):** `{ "programme": {...} }`

---

### PUT `/programmes/:id`
Update a programme. **Super Admin only.**

---

### DELETE `/programmes/:id`
Delete a programme. **Super Admin only.**

**Response (200):** `{ "success": true }`

---

## Health Check

### GET `/health`
Returns server status.

**Response (200):** `{ "status": "ok", "timestamp": "..." }`

---

## Error Responses

All errors follow this format:
```json
{ "error": "Error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Missing or invalid token |
| 403 | Insufficient role |
| 404 | Resource not found |
| 500 | Internal server error (message hidden in production) |
