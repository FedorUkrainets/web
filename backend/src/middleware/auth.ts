import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { config } from '../config';
import { ApiError } from '../utils/api-error';

type JwtPayload = {
  user_id: string;
  role: UserRole;
};

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.authUser = { userId: payload.user_id, role: payload.role };
    next();
  } catch {
    throw new ApiError(401, 'Unauthorized');
  }
}
