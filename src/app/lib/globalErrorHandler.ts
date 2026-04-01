import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError.js';
import { sendError } from './response.js';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = 'Database operation failed';
    error = new AppError(message, 400);
  }

  if (err.name === 'PrismaClientValidationError') {
    const message = 'Invalid data provided';
    error = new AppError(message, 400);
  }

  // Send error response
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
  } else {
    sendError(res, 'Something went wrong', 500, process.env.NODE_ENV === 'development' ? err.message : undefined);
  }
};