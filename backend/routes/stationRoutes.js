const express = require('express');
const stationController = require('../controllers/stationController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.get('/', authRequired, stationController.list);
router.post('/', authRequired, stationController.create);
router.put('/:id', authRequired, stationController.update);
router.patch('/:id/status', authRequired, stationController.changeStatus);
router.delete('/:id', authRequired, stationController.remove);

module.exports = router;
