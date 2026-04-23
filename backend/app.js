const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { query } = require('./db/database');

const app = express();

app.use(cors());
app.use(express.json());

// Request logger с длительностью и статусом.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[HTTP] ${req.ip} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// Liveness: процесс жив.
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Readiness: БД реально отвечает.
app.get('/health/db', async (_req, res) => {
  try {
    const r = await query('SELECT 1 as ok');
    res.json({ status: 'ok', db: r.rows[0].ok === 1 });
  } catch (error) {
    console.error('[HEALTH] db check failed:', error.message);
    res.status(503).json({ status: 'error', message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

app.use((req, res) => {
  console.warn(`[HTTP] 404 no route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
