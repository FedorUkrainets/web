require('dotenv').config();

const app = require('./app');
const { initDatabase } = require('./db/init');

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, HOST, () => {
      console.log(`Backend is running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
