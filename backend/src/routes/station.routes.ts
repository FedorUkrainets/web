import { Router } from 'express';
import { stationController } from '../controllers/station.controller';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/', authRequired, (req, res, next) => stationController.create(req, res, next));
router.get('/', (req, res, next) => stationController.list(req, res, next));
router.get('/:id', (req, res, next) => stationController.getById(req, res, next));

export default router;
