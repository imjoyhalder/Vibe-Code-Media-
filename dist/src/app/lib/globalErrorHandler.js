import { AppError } from './AppError.js';
import { sendError } from './response.js';
export const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error
    console.error(err);
    // Prisma known request errors
    if (err.name === 'PrismaClientKnownRequestError') {
        let message = 'Database operation failed';
        let statusCode = 400;
        const code = err.code;
        switch (code) {
            case 'P2002':
                message = 'Duplicate entry: A record with this information already exists';
                statusCode = 409; // Conflict
                break;
            case 'P2025':
                message = 'Resource not found';
                statusCode = 404;
                break;
            case 'P2003':
                message = 'Invalid reference: Related record does not exist';
                statusCode = 400;
                break;
            case 'P1001':
                message = 'Database connection error';
                statusCode = 503; // Service Unavailable
                break;
            default:
                message = `Database error: ${err.message}`;
        }
        error = new AppError(message, statusCode);
    }
    // Prisma validation errors
    if (err.name === 'PrismaClientValidationError') {
        const message = 'Invalid data provided';
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
    // Send error response
    if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
    }
    else {
        sendError(res, 'Something went wrong', 500, process.env.NODE_ENV === 'development' ? err.message : undefined);
    }
};
