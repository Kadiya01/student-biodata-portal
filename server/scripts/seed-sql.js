#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable. Create a server/.env or set DATABASE_URL in your shell.');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // Execute the full SQL content. PostgreSQL supports multiple statements.
  await client.query(sql);
}

async function main() {
  try {
    await client.connect();

    const schemaPath = path.resolve(__dirname, '../../database/schema/001_schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seeds/001_seed_core.sql');

    console.log('Applying schema:', schemaPath);
    await runSqlFile(schemaPath);
    console.log('Schema applied.');

    console.log('Applying seeds:', seedPath);
    await runSqlFile(seedPath);
    console.log('Seeds applied.');

    await client.end();
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err.message || err);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

main();
