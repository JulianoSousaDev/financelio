import { readFileSync } from 'fs';

// Get env vars
const connStr = process.env.SUPABASE_CONNECTION_STRING;
if (!connStr) {
  console.error('SUPABASE_CONNECTION_STRING not set');
  process.exit(1);
}

// Dynamic import of postgres
const postgres = (await import('postgres')).default;

const sql = postgres(connStr, { ssl: 'require', max: 1 });

const migration = readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8');

console.log('Running migration...');
try {
  await sql.unsafe(migration);
  console.log('✅ Migration applied successfully!');
} catch (err) {
  console.error('❌ Migration failed:', err);
  process.exit(1);
} finally {
  await sql.end();
}
