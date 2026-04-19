require('dotenv').config();

const app = require('./app');
const { initDatabase } = require('./db/init');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, HOST, () => {
      console.log(`Backend is running on http://${HOST}:${PORT}`);
      console.log('Чтобы узнать локальный IP, используйте команду: ipconfig (Windows) или ifconfig/ip a (Linux/macOS).');
      console.log(`С другого устройства в локальной сети обращайтесь так: http://192.168.X.X:${PORT}/stations`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
