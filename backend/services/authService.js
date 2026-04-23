const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
if (JWT_SECRET === 'dev-secret') {
  console.warn('[AUTH] WARNING: using default JWT_SECRET. Set JWT_SECRET env var in production.');
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

async function register(body = {}) {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  console.log(`[AUTH] register attempt: email="${email}" pwLen=${password.length}`);

  if (!email || !password) {
    throw badRequest('Email and password are required. Send JSON body: {"email":"...","password":"..."} with header Content-Type: application/json');
  }
  if (!EMAIL_RE.test(email)) throw badRequest('Invalid email format');
  if (password.length < 6) throw badRequest('Password must be at least 6 characters');

  const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rowCount > 0) {
    console.warn(`[AUTH] register: email already taken: ${email}`);
    const error = new Error('Email already exists');
    error.status = 409;
    throw error;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const insert = await query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
    [email, passwordHash, 'user'],
  );
  console.log(`[AUTH] register: user created id=${insert.rows[0].id} email=${email}`);
  return { message: 'Registered successfully' };
}

async function login(body = {}) {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  console.log(`[AUTH] login attempt: email="${email}" pwLen=${password.length}`);

  if (!email || !password) {
    throw badRequest('Email and password are required. Send JSON body: {"email":"...","password":"..."} with header Content-Type: application/json');
  }

  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    console.warn(`[AUTH] login: invalid credentials for ${email}`);
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const accessToken = jwt.sign(
    { user_id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
  console.log(`[AUTH] login: success id=${user.id} role=${user.role}`);
  return { access_token: accessToken, token_type: 'bearer' };
}

module.exports = { register, login, JWT_SECRET };
