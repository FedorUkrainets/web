require('dotenv').config();

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Создайте файл backend/.env и укажите строку подключения, ' +
    'например: DATABASE_URL=postgres://postgres:postgres@localhost:5432/evcharge',
  );
}

const ssl = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { pool, query };
