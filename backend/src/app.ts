import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import stationRoutes from './routes/station.routes';
import chargingSessionRoutes from './routes/charging-session.routes';
import { errorHandler } from './middleware/error-handler';
import { ApiError } from './utils/api-error';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/charging-sessions', chargingSessionRoutes);

app.use((_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
});

app.use(errorHandler);
