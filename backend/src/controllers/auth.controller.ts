import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const token = await authService.login(req.body);
      return res.status(200).json(token);
    } catch (error) {
      return next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.authUser!.userId);
      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
