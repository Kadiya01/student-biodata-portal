-- Seed data for Student Bio-Data System
-- Inserts core roles, departments, and programmes

BEGIN;

-- Roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator role'),
  ('registrar', 'Registrar role'),
  ('officer', 'Admission Officer'),
  ('student', 'Student role')
ON CONFLICT (name) DO NOTHING;

-- Departments
INSERT INTO departments (name, code) VALUES
  ('Nursing', 'NURS'),
  ('Public Health', 'PUBH'),
  ('Medical Laboratory Science', 'MLS'),
  ('Community Health', 'CHS')
ON CONFLICT (code) DO NOTHING;

-- Programmes (referencing departments by code)
INSERT INTO programmes (department_id, name, code, duration_months) VALUES
  ((SELECT id FROM departments WHERE code='NURS'), 'Nursing Diploma', 'NURS-DIP', 36),
  ((SELECT id FROM departments WHERE code='NURS'), 'Nursing Degree', 'NURS-BSC', 48),
  ((SELECT id FROM departments WHERE code='PUBH'), 'Public Health Diploma', 'PUBH-DIP', 24),
  ((SELECT id FROM departments WHERE code='MLS'), 'Medical Laboratory Science', 'MLS-DIP', 36)
ON CONFLICT (code) DO NOTHING;

COMMIT;

-- Useful indexes for common queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_number ON student_profiles (student_number);
CREATE INDEX IF NOT EXISTS idx_student_profiles_programme_id ON student_profiles (programme_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents (student_id);
