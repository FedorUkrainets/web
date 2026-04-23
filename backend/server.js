require('dotenv').config();

const app = require('./app');
const { initDatabase } = require('./db/init');
const { pool } = require('./db/database');

// Railway пробрасывает порт через process.env.PORT и требует bind на 0.0.0.0.
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const ENV = process.env.NODE_ENV || 'development';

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[FATAL] uncaughtException:', error);
});

async function startServer() {
  console.log(`[BOOT] starting backend — env=${ENV}, host=${HOST}, port=${PORT}`);
  try {
    await initDatabase();
  } catch (error) {
    console.error('[BOOT] database init failed — aborting startup:', error.message);
    process.exit(1);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`[BOOT] backend ready on http://${HOST}:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`[BOOT] ${signal} received, shutting down...`);
    server.close(() => console.log('[BOOT] http server closed'));
    try {
      await pool.end();
      console.log('[BOOT] pg pool drained');
    } catch (e) {
      console.error('[BOOT] pool drain error:', e.message);
    }
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
