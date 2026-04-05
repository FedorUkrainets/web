import { Router } from 'express';
import { chargingSessionController } from '../controllers/charging-session.controller';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/', authRequired, (req, res, next) => chargingSessionController.create(req, res, next));
router.get('/', authRequired, (req, res, next) => chargingSessionController.list(req, res, next));
router.get('/:id', authRequired, (req, res, next) => chargingSessionController.getById(req, res, next));
router.patch('/:id/start', authRequired, (req, res, next) => chargingSessionController.start(req, res, next));
router.patch('/:id/complete', authRequired, (req, res, next) => chargingSessionController.complete(req, res, next));
router.patch('/:id/cancel', authRequired, (req, res, next) => chargingSessionController.cancel(req, res, next));

export default router;
