const stationService = require('../services/stationService');

async function list(req, res, next) {
  try {
    res.json(await stationService.listStations());
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    res.status(201).json(await stationService.createStation(req.body));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    res.json(await stationService.deleteStation(Number(req.params.id)));
  } catch (error) {
    next(error);
  }
}

async function changeStatus(req, res, next) {
  try {
    res.json(await stationService.changeStationStatus(Number(req.params.id), req.body.status));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    res.json(await stationService.changeStationStatus(Number(req.params.id), req.body.status));
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, remove, changeStatus, update };
