const db = require('./database');
const bcrypt = require('bcryptjs');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'CREATED',
      capacity_kw REAL NOT NULL,
      current_load_kw REAL NOT NULL,
      total_chargers INTEGER NOT NULL,
      active_chargers INTEGER NOT NULL,
      revenue REAL NOT NULL DEFAULT 0,
      last_maintenance_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chargers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      power_kw REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
    );
  `);

  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@demo.local');
  if (!admin) {
    const passwordHash = bcrypt.hashSync('Admin123!', 10);
    db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run('admin@demo.local', passwordHash, 'admin');
  }
}

module.exports = { initDatabase };
