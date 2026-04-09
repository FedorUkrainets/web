const app = require('./app');
const { initDatabase } = require('./db/init');

const PORT = process.env.PORT || 3001;
initDatabase();

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
