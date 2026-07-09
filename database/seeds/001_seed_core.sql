-- Seed data for Student Bio-Data System
-- Inserts core roles, departments, programmes, and sample users

BEGIN;

-- Roles
INSERT INTO public."Role" (id, name, description, "createdAt") VALUES
  (gen_random_uuid(), 'student', 'Student role', NOW()),
  (gen_random_uuid(), 'reviewer', 'Reviewer role', NOW()),
  (gen_random_uuid(), 'super_admin', 'Super Admin role', NOW())
ON CONFLICT (name) DO NOTHING;

-- Departments
INSERT INTO public."Department" (id, name, code, "createdAt") VALUES
  (gen_random_uuid(), 'Nursing', 'NURS', NOW()),
  (gen_random_uuid(), 'Public Health', 'PUBH', NOW()),
  (gen_random_uuid(), 'Medical Laboratory Science', 'MLS', NOW()),
  (gen_random_uuid(), 'Community Health', 'CHS', NOW())
ON CONFLICT (code) DO NOTHING;

-- Programmes (referencing departments by code)
INSERT INTO public."Programme" (id, "departmentId", name, code, "durationMonths", "createdAt")
SELECT gen_random_uuid(), d.id, p.name, p.code, p.duration, NOW()
FROM (VALUES
  ('NURS', 'Nursing Diploma', 'NURS-DIP', 36),
  ('NURS', 'Nursing Degree (B.NSc)', 'NURS-BSC', 48),
  ('PUBH', 'Public Health Diploma', 'PUBH-DIP', 24),
  ('CHS', 'Community Health Extension Worker (CHEW)', 'CHS-CHEW', 36),
  ('CHS', 'Junior CHEW', 'CHS-JCHEW', 24),
  ('MLS', 'Medical Laboratory Technician (MLT)', 'MLS-MLT', 36),
  ('MLS', 'Pharmacy Technician', 'MLS-PHT', 24)
) AS p(dept_code, name, code, duration)
JOIN public."Department" d ON d.code = p.dept_code
ON CONFLICT (code) DO NOTHING;

-- Useful indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON public."User" (email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_number ON public."StudentProfile" ("studentNumber");
CREATE INDEX IF NOT EXISTS idx_student_profiles_programme_id ON public."StudentProfile" ("programmeId");
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON public."Document" ("studentId");

COMMIT;
