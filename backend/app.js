const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { query } = require('./db/database');

const app = express();

// --- CORS ---------------------------------------------------------------
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : '*';

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// --- Body parsing (tolerant) -------------------------------------------
// JSON: принимаем и стандартный application/json, и клиентов-раздолбаев,
// которые шлют JSON без заголовка (type: '*/*' fallback только для /api/*).
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // на случай form-data
// Ручной fallback для запросов без Content-Type: пытаемся распарсить как JSON.
app.use((req, _res, next) => {
  if (req.method === 'POST' && (!req.body || Object.keys(req.body).length === 0) && req.headers['content-length'] !== '0') {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (raw) {
        try {
          req.body = JSON.parse(raw);
        } catch {
          console.warn(`[BODY] raw body not JSON (${raw.length}B) on ${req.originalUrl}`);
        }
      }
      next();
    });
  } else {
    next();
  }
});

// Гарантия: req.body всегда объект.
app.use((req, _res, next) => {
  if (!req.body || typeof req.body !== 'object') req.body = {};
  next();
});

// --- Request logger -----------------------------------------------------
app.use((req, res, next) => {
  const start = Date.now();
  // Диагностика тела для auth-ручек (пароль маскируем).
  if (req.method === 'POST' && /\/(login|register)(\/|$)/.test(req.originalUrl)) {
    const hasEmail = Boolean(req.body?.email);
    const hasPassword = Boolean(req.body?.password);
    const ct = req.headers['content-type'] || '<none>';
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ct="${ct}" body.keys=[${Object.keys(req.body).join(',')}] hasEmail=${hasEmail} hasPassword=${hasPassword}`);
  }
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[HTTP] ${req.ip} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// --- Root & health ------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    service: 'ev-charging-demo-backend',
    status: 'ok',
    endpoints: {
      health: '/health',
      healthDb: '/health/db',
      register: 'POST /api/register  (alias: /api/auth/register)',
      login: 'POST /api/login  (alias: /api/auth/login)',
      stations: 'GET /api/stations (Bearer token)',
    },
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/health/db', async (_req, res) => {
  try {
    const r = await query('SELECT 1 as ok');
    res.json({ status: 'ok', db: r.rows[0].ok === 1 });
  } catch (error) {
    console.error('[HEALTH] db check failed:', error.message);
    res.status(503).json({ status: 'error', message: error.message });
  }
});

// --- API routes ---------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // алиасы /api/login, /api/register
app.use('/api/stations', stationRoutes);

// --- 404 & errors -------------------------------------------------------
app.use((req, res) => {
  console.warn(`[HTTP] 404 no route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
