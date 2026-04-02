import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../../lib/AppError.js';
import { prisma } from '../../lib/prisma.js';

interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required: token missing', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication required: token malformed', 401));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError('Server configuration error: missing JWT_SECRET', 500));
    }

    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    if (!decoded || !decoded.userId) {
      return next(new AppError('Invalid authentication token', 401));
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return next(new AppError('User not found for provided token', 401));
    }

    (req as any).userId = decoded.userId;
    (req as any).user = user;

    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalid', 401));
    }

    return next(error);
  }
};