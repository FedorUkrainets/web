import { NextFunction, Request, Response } from 'express';
import { stationService } from '../services/station.service';

export class StationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await stationService.createStationWithConnectors(req.body);
      return res.status(201).json(station);
    } catch (error) {
      return next(error);
    }
  }

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const stations = await stationService.findAll();
      return res.status(200).json(stations);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await stationService.findById(String(req.params.id));
      return res.status(200).json(station);
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await stationService.changeStatus(String(req.params.id), req.body);
      return res.status(200).json(station);
    } catch (error) {
      return next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await stationService.remove(String(req.params.id));
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const stationController = new StationController();
