require('dotenv').config();

const app = require('./app');
const { initDatabase } = require('./db/init');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
