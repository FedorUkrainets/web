const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function register({ email, password, role = 'user' }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) {
    const error = new Error('Email already exists');
    error.status = 409;
    throw error;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(email, passwordHash, role);

  return { message: 'Registered successfully' };
}

function login({ email, password }) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const accessToken = jwt.sign({ user_id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  return {
    access_token: accessToken,
    token_type: 'bearer',
  };
}

module.exports = { register, login, JWT_SECRET };
