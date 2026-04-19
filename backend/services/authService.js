const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function register({ email, password }) {
  if (!email || !password) throw badRequest('Email and password are required');
  if (!EMAIL_RE.test(email)) throw badRequest('Invalid email format');
  if (password.length < 6) throw badRequest('Password must be at least 6 characters');

  const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rowCount > 0) {
    const error = new Error('Email already exists');
    error.status = 409;
    throw error;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  // Публичная регистрация создаёт только обычных пользователей — роль 'admin'
  // выдаётся вручную через базу/сид, никогда из тела запроса.
  await query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
    [email, passwordHash, 'user'],
  );

  return { message: 'Registered successfully' };
}

async function login({ email, password }) {
  if (!email || !password) throw badRequest('Email and password are required');

  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const accessToken = jwt.sign(
    { user_id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
  return { access_token: accessToken, token_type: 'bearer' };
}

module.exports = { register, login, JWT_SECRET };
