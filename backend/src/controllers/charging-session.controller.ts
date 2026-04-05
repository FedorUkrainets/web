import { NextFunction, Request, Response } from 'express';
import { chargingSessionService } from '../services/charging-session.service';

export class ChargingSessionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await chargingSessionService.create(req.body);
      return res.status(201).json(session);
    } catch (error) {
      return next(error);
    }
  }

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await chargingSessionService.findAll();
      return res.status(200).json(sessions);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await chargingSessionService.findById(req.params.id);
      return res.status(200).json(session);
    } catch (error) {
      return next(error);
    }
  }

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await chargingSessionService.start(req.params.id);
      return res.status(200).json(session);
    } catch (error) {
      return next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await chargingSessionService.complete(req.params.id, req.body);
      return res.status(200).json(session);
    } catch (error) {
      return next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await chargingSessionService.cancel(req.params.id);
      return res.status(200).json(session);
    } catch (error) {
      return next(error);
    }
  }
}

export const chargingSessionController = new ChargingSessionController();
