const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function register({ email, password, role = 'user' }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rowCount > 0) {
    const error = new Error('Email already exists');
    error.status = 409;
    throw error;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  await query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [email, passwordHash, role]);

  return { message: 'Registered successfully' };
}

async function login({ email, password }) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
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
