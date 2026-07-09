-- Seed data for Student Bio-Data System
-- Inserts core roles, departments, programmes, and sample users
-- Uses snake_case table names matching 001_schema.sql

BEGIN;

-- Roles
INSERT INTO roles (id, name, description, created_at) VALUES
  (gen_random_uuid(), 'student', 'Student role', NOW()),
  (gen_random_uuid(), 'reviewer', 'Reviewer role', NOW()),
  (gen_random_uuid(), 'super_admin', 'Super Admin role', NOW())
ON CONFLICT (name) DO NOTHING;

-- Departments
INSERT INTO departments (id, name, code, created_at) VALUES
  (gen_random_uuid(), 'Nursing', 'NURS', NOW()),
  (gen_random_uuid(), 'Public Health', 'PUBH', NOW()),
  (gen_random_uuid(), 'Medical Laboratory Science', 'MLS', NOW()),
  (gen_random_uuid(), 'Community Health', 'CHS', NOW())
ON CONFLICT (code) DO NOTHING;

-- Programmes (referencing departments by code)
INSERT INTO programmes (id, department_id, name, code, duration_months, created_at)
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
JOIN departments d ON d.code = p.dept_code
ON CONFLICT (code) DO NOTHING;

-- Useful indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_number ON student_profiles (student_number);
CREATE INDEX IF NOT EXISTS idx_student_profiles_programme_id ON student_profiles (programme_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents (student_id);

COMMIT;
