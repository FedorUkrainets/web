const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { query } = require('./db/database');

const app = express();

// Railway стоит за прокси — доверяем X-Forwarded-* для корректного req.ip и т.п.
app.set('trust proxy', true);

// --- CORS (bulletproof) ------------------------------------------------
// Белый список origin'ов можно задать через CORS_ORIGIN="https://a,https://b".
// Если переменная не задана — пускаем всех ("*"). Так как аутентификация через
// Bearer-токен (cookies не используем), '*' безопасен.
const allowlist = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : null; // null == allow all

function originAllowed(origin) {
  if (!allowlist) return true;
  if (!origin) return true; // server-to-server, curl
  return allowlist.includes(origin);
}

// Ручной middleware — страхуем от того, что cors() по какой-то причине не выставит
// заголовки (редко, но случается на некоторых прокси/CDN).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (originAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  return next();
});

// Пакетный cors() оставляем как второй слой (на случай тонких кейсов).
app.use(cors({
  origin: (origin, cb) => (originAllowed(origin) ? cb(null, true) : cb(new Error('CORS blocked'))),
  credentials: false,
}));

console.log(`[CORS] allowlist=${allowlist ? allowlist.join(',') : '*'}`);

// --- Body parsing (tolerant) -------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, _res, next) => {
  if (req.method === 'POST' && (!req.body || Object.keys(req.body).length === 0) && req.headers['content-length'] !== '0') {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (raw) {
        try { req.body = JSON.parse(raw); } catch { console.warn(`[BODY] raw body not JSON (${raw.length}B) on ${req.originalUrl}`); }
      }
      next();
    });
  } else {
    next();
  }
});
app.use((req, _res, next) => {
  if (!req.body || typeof req.body !== 'object') req.body = {};
  next();
});

// --- Request logger ----------------------------------------------------
app.use((req, res, next) => {
  const start = Date.now();
  const origin = req.headers.origin || '<no-origin>';
  if (req.method === 'POST' && /\/(login|register)(\/|$)/.test(req.originalUrl)) {
    const ct = req.headers['content-type'] || '<none>';
    console.log(`[HTTP] ${req.method} ${req.originalUrl} origin="${origin}" ct="${ct}" body.keys=[${Object.keys(req.body).join(',')}]`);
  } else {
    console.log(`[HTTP] ${req.method} ${req.originalUrl} origin="${origin}"`);
  }
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[HTTP] ${req.ip} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// --- Root & health -----------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    service: 'ev-charging-demo-backend',
    status: 'ok',
    endpoints: {
      health: '/health',
      healthDb: '/health/db',
      register: 'POST /api/register (alias: /api/auth/register)',
      login: 'POST /api/login (alias: /api/auth/login)',
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

// --- API routes --------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/stations', stationRoutes);

// --- 404 & errors ------------------------------------------------------
app.use((req, res) => {
  console.warn(`[HTTP] 404 no route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
