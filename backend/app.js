const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { query } = require('./db/database');

const app = express();

// --- CORS ---------------------------------------------------------------
// Разрешаем всё, пока auth через Bearer-токен (cookies не используем).
// Если захотите ограничить — задайте CORS_ORIGIN="https://your-frontend.app"
// или CSV: CORS_ORIGIN="https://a.app,https://b.app".
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : '*';

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

app.use(express.json());

// --- Request logger -----------------------------------------------------
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[HTTP] ${req.ip} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// --- Root & health ------------------------------------------------------
// Корневой эндпоинт: чтобы открыв URL в браузере сразу было видно, что сервис жив.
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
// Канонический префикс:
app.use('/api/auth', authRoutes);
// Алиасы под запрос задачи — чтобы работали и /api/register, и /api/login:
app.use('/api', authRoutes);

app.use('/api/stations', stationRoutes);

// --- 404 & errors -------------------------------------------------------
app.use((req, res) => {
  console.warn(`[HTTP] 404 no route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
