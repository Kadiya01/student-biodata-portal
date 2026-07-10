# Database — Student Bio-Data System

PostgreSQL schema and seed files for the Student Bio-Data & Records Management System.

## Schema

The database is managed via **Prisma ORM**. The canonical schema is in `../server/prisma/schema.prisma`.

### Tables

| Table | Purpose |
|-------|---------|
| `Role` | User roles (student, reviewer, super_admin) |
| `User` | User accounts with hashed passwords |
| `Department` | Academic departments |
| `Programme` | Academic programmes within departments |
| `StudentProfile` | Student biodata (JSONB), status tracking |
| `NextOfKin` | Student emergency contacts |
| `Document` | Uploaded documents with Cloudinary/local URLs |
| `RefreshToken` | SHA-256 hashed refresh tokens with expiry |
| `PasswordResetToken` | Time-limited password reset tokens |
| `Notification` | In-app user notifications |
| `AuditLog` | Activity audit trail |

### Migrations

```bash
# Apply pending migrations
npx prisma migrate deploy

# Create new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Regenerate Prisma client
npx prisma generate
```

### Raw SQL (Alternative)

Run the raw SQL files directly against a PostgreSQL database:

```bash
psql "$DATABASE_URL" -f database/schema/001_schema.sql
psql "$DATABASE_URL" -f database/seeds/001_seed_core.sql
```

Requires the `pgcrypto` extension for `gen_random_uuid()`:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Seed Data

```bash
cd server
npm run seed
```

Creates test accounts:
| Role | Email | Password |
|------|-------|----------|
| Student | student@college.edu.ng | password123 |
| Reviewer | reviewer@college.edu.ng | password123 |
| Super Admin | admin@college.edu.ng | password123 |
