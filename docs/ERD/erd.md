 # ERD

See `database/schema/001_schema.sql` for table definitions. The key relationships:

- `roles` -> `users` (one-to-many)
- `users` -> `student_profiles` (one-to-one)
- `departments` -> `programmes` (one-to-many)
- `programmes` -> `student_profiles` (one-to-many)
- `student_profiles` -> `documents` (one-to-many)
- `student_profiles` -> `next_of_kin` (one-to-many)
- `users` -> `audit_logs` (one-to-many)
