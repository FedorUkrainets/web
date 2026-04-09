const stationService = require('../services/stationService');

function list(req, res, next) {
  try {
    res.json(stationService.listStations());
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    res.status(201).json(stationService.createStation(req.body));
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    res.json(stationService.deleteStation(Number(req.params.id)));
  } catch (error) {
    next(error);
  }
}

function changeStatus(req, res, next) {
  try {
    res.json(stationService.changeStationStatus(Number(req.params.id), req.body.status));
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, remove, changeStatus };
