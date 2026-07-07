PostgreSQL schema and seeds for the Student Bio-Data system.

Run the schema and seed files against a Postgres database (development):

psql "$DATABASE_URL" -f database/schema/001_schema.sql
psql "$DATABASE_URL" -f database/seeds/001_seed_core.sql

Use `gen_random_uuid()` from the `pgcrypto` extension; ensure the extension exists.
