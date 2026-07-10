# Software Requirements Specification (SRS)
## Student Bio-Data & Records Management System

**Institution:** Rauda College of Health Science and Technology, Kano  
**Version:** 1.0  
**Date:** July 2026

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the functional and non-functional requirements for the Student Bio-Data Portal, a web application for managing student registration, biodata collection, and submission review.

### 1.2 Scope
The system enables students to register, complete a multi-step biodata form, and submit it for institutional review. Staff can review, approve, or reject submissions. Administrators manage reviewer accounts and monitor system activity.

### 1.3 Definitions
- **Biodata:** A comprehensive student profile including personal, educational, and guardian information
- **SSCE:** Senior Secondary Certificate Examination (WAEC, NECO, NABTEB)
- **Credit Pass:** Grade A1 through C6
- **Reviewer:** Staff member who reviews and approves/rejects student submissions
- **Super Admin:** System administrator with full access

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Students can register with email, password, name, phone | High |
| FR-02 | Auto-generate registration number (RCHST-YYYY-NNNNN) on registration | High |
| FR-03 | Students and staff can login with email/password | High |
| FR-04 | JWT-based session with 1-hour expiry | High |
| FR-05 | Role-based access: student, reviewer, super_admin | High |
| FR-06 | Password reset via token (15-minute expiry) | Medium |
| FR-07 | Rate limiting on login/register (10 attempts/15 min) | High |

### 2.2 Student Biodata Wizard
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10 | 4-step wizard: Personal, Educational, Guardian, Review | High |
| FR-11 | Passport photo upload (drag-and-drop, max 2MB, image compression) | High |
| FR-12 | Personal info: name, DOB, gender, email, phone, address | High |
| FR-13 | Educational info: primary/secondary school, SSCE type | High |
| FR-14 | Dynamic subject/grade table with locked English + Maths rows | High |
| FR-15 | Live credit counter (A1-C6 = credit) | High |
| FR-16 | Eligibility: English >= C6 AND Maths >= C6 AND total credits >= 5 | High |
| FR-17 | Guardian info: name, phone, relationship, address | High |
| FR-18 | Review page showing all entered data before submission | High |
| FR-19 | Auto-save draft on step navigation | Medium |
| FR-20 | Block submission if ineligible | High |

### 2.3 Submission & Review
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-30 | Students can view submission status (animated timeline) | High |
| FR-31 | Reviewers can view all submissions with search/filter | High |
| FR-32 | Reviewers can approve/reject with comments | High |
| FR-33 | Reviewers can export filtered records as CSV | Medium |
| FR-34 | Reviewers can export records as PDF booklet | Medium |
| FR-35 | Notifications on approval/rejection | High |

### 2.4 Administration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-40 | Super Admin can create/edit/deactivate reviewer accounts | High |
| FR-41 | Super Admin can view system-wide stats | High |
| FR-42 | Super Admin can view live audit log | Medium |
| FR-43 | Audit logging for all significant actions | High |

---

## 3. Non-Functional Requirements

### 3.1 Performance
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | Page load time < 3 seconds on 3G connection | High |
| NFR-02 | API response time < 500ms for read operations | Medium |
| NFR-03 | Support 100 concurrent users | Medium |

### 3.2 Security
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-10 | Passwords hashed with bcrypt (10 rounds) | High |
| NFR-11 | JWT secrets must be 32+ characters, cryptographically random | High |
| NFR-12 | Input sanitization (XSS protection) | High |
| NFR-13 | CORS restricted to known origins | High |
| NFR-14 | HTTPS in production | High |
| NFR-15 | File upload type and size validation | High |
| NFR-16 | Error messages do not leak internals in production | High |

### 3.3 Usability
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-20 | Responsive design (mobile + desktop) | High |
| NFR-21 | Accessible form labels and error messages | Medium |
| NFR-22 | Consistent branding (teal/aqua/amber palette) | Medium |
| NFR-23 | Toast notifications for user feedback | Medium |

### 3.4 Reliability
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-30 | 99.5% uptime (excluding planned maintenance) | Medium |
| NFR-31 | Graceful error handling with user-friendly messages | High |
| NFR-32 | Data persistence across server restarts | High |

---

## 4. User Roles & Permissions

| Action | Student | Reviewer | Super Admin |
|--------|---------|----------|-------------|
| Register/Login | Yes | Yes | Yes |
| Complete Biodata | Yes | - | - |
| Submit Biodata | Yes | - | - |
| View Own Submission | Yes | - | - |
| View All Submissions | - | Yes | Yes |
| Approve/Reject | - | Yes | Yes |
| Manage Reviewers | - | - | Yes |
| View Audit Logs | - | Yes | Yes |
| Export CSV/PDF | - | Yes | Yes |

---

## 5. Data Model

### 5.1 Entities
- **User** — id, email, passwordHash, firstName, lastName, role (FK), isActive, createdAt
- **Role** — id, name (student, reviewer, super_admin)
- **StudentProfile** — id, userId (FK), studentNumber, status (draft/submitted/under_review/approved/rejected), bio (JSONB), reviewerComments, reviewedBy, reviewedAt
- **Department** — id, name, code
- **Programme** — id, name, code, departmentId (FK), durationMonths
- **Document** — id, studentId (FK), fileUrl, fileName, fileType, sizeBytes
- **NextOfKin** — id, studentId (FK), name, phone, relationship, address
- **Notification** — id, userId, title, message, read, createdAt
- **AuditLog** — id, userId, action, entityType, entityId, details (JSONB), ipAddress, createdAt

---

## 6. Constraints & Assumptions

- PostgreSQL database via Neon (serverless, connection pooling)
- Frontend deployed on Vercel (static SPA)
- Backend deployed on Render.com (Docker, Node.js 18)
- File storage: local multer (dev), Cloudinary (planned for production)
- No email service currently — password reset tokens returned in API response
- Single-server deployment (no horizontal scaling)
