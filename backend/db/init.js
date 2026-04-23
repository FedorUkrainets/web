const { query, verifyConnection } = require('./database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  console.log('[DB] initDatabase: start');
  try {
    await verifyConnection();
  } catch (error) {
    console.error('[DB] initDatabase: cannot connect ->', error.message);
    throw error;
  }

  try {
    console.log('[DB] initDatabase: creating tables if missing...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS stations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'CREATED',
        capacity_kw DOUBLE PRECISION NOT NULL,
        current_load_kw DOUBLE PRECISION NOT NULL,
        total_chargers INTEGER NOT NULL,
        active_chargers INTEGER NOT NULL,
        revenue DOUBLE PRECISION NOT NULL DEFAULT 0,
        last_maintenance_at DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chargers (
        id SERIAL PRIMARY KEY,
        station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        power_kw DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('[DB] initDatabase: tables OK');

    const passwordHash = bcrypt.hashSync('Admin123!', 10);
    const seedResult = await query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@demo.local', passwordHash, 'admin'],
    );
    if (seedResult.rowCount > 0) {
      console.log('[DB] seed: default admin user created (admin@demo.local / Admin123!)');
    } else {
      console.log('[DB] seed: default admin already exists, skipping');
    }
  } catch (error) {
    console.error('[DB] initDatabase: FAILED ->', error.message);
    throw error;
  }
  console.log('[DB] initDatabase: done');
}

module.exports = { initDatabase };
