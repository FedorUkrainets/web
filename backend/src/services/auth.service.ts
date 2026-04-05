import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApiError } from '../utils/api-error';
import { config } from '../config';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.nativeEnum(UserRole).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthService {
  async register(input: unknown) {
    const data = registerSchema.parse(input);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new ApiError(409, 'Email already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash,
        role: data.role ?? UserRole.USER,
      },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });

    return user;
  }

  async login(input: unknown) {
    const data = loginSchema.parse(input);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const accessToken = jwt.sign(
      { user_id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1h' },
    );

    return {
      access_token: accessToken,
      token_type: 'bearer',
    };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });

    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }
}

export const authService = new AuthService();
