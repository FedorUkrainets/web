require('dotenv').config();

const { Pool } = require('pg');

const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
  console.error('[DB] FATAL: DATABASE_URL is not set.');
  console.error('[DB] Создайте backend/.env или задайте переменную в Railway:');
  console.error('[DB]   DATABASE_URL=postgres://user:password@host:5432/dbname');
  throw new Error('DATABASE_URL is not set');
}

// Маскируем пароль для лога. postgres://user:PASSWORD@host/db
function maskUrl(url) {
  try {
    const u = new URL(url);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '<unparseable DATABASE_URL>';
  }
}

console.log(`[DB] DATABASE_URL = ${maskUrl(rawUrl)}`);

// SSL включаем:
//  - в production (Railway/Render/Heroku дают managed Postgres с SSL),
//  - если URL указывает на известного managed-провайдера,
//  - или если явно попросили через PGSSL=true.
const isManagedHost = /\b(railway|render|neon|supabase|amazonaws|aiven|heroku)\b/i.test(rawUrl);
const shouldUseSsl = process.env.PGSSL === 'true'
  || process.env.NODE_ENV === 'production'
  || isManagedHost;

const ssl = shouldUseSsl ? { rejectUnauthorized: false } : false;
console.log(`[DB] SSL = ${ssl ? 'enabled (rejectUnauthorized=false)' : 'disabled'}`);

const pool = new Pool({
  connectionString: rawUrl,
  ssl,
  max: Number(process.env.PG_POOL_MAX) || 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (error) => {
  console.error('[DB] Unexpected PostgreSQL pool error:', error.message);
});

async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const ms = Date.now() - start;
    if (process.env.DB_LOG === 'verbose') {
      console.log(`[DB] ok (${ms}ms) ${text.split('\n')[0].slice(0, 80)}`);
    }
    return result;
  } catch (error) {
    const ms = Date.now() - start;
    console.error(`[DB] FAIL (${ms}ms) ${text.split('\n')[0].slice(0, 80)} -> ${error.message}`);
    throw error;
  }
}

async function verifyConnection() {
  const client = await pool.connect();
  try {
    const r = await client.query('SELECT NOW() as now, current_database() as db, current_user as usr');
    console.log(`[DB] connected: db="${r.rows[0].db}" user="${r.rows[0].usr}" at ${r.rows[0].now.toISOString()}`);
  } finally {
    client.release();
  }
}

module.exports = { pool, query, verifyConnection };
