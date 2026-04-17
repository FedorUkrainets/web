const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

app.use((_req, _res, next) => next({ status: 404, message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
