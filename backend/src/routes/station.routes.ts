import { Router } from 'express';
import { stationController } from '../controllers/station.controller';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/', authRequired, (req, res, next) => stationController.create(req, res, next));
router.get('/', authRequired, (req, res, next) => stationController.list(req, res, next));
router.get('/:id', authRequired, (req, res, next) => stationController.getById(req, res, next));
router.patch('/:id/status', authRequired, (req, res, next) => stationController.updateStatus(req, res, next));
router.delete('/:id', authRequired, (req, res, next) => stationController.remove(req, res, next));

export default router;
