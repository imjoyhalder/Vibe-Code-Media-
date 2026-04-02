import jwt from 'jsonwebtoken';
import { AppError } from '../lib/AppError.js';
import { prisma } from '../lib/prisma.js';
export const authenticate = async (req, res, next) => {
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
        const decoded = jwt.verify(token, secret);
        if (!decoded || !decoded.userId) {
            return next(new AppError('Invalid authentication token', 401));
        }
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return next(new AppError('User not found for provided token', 401));
        }
        req.userId = decoded.userId;
        req.user = user;
        return next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', 401));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Token invalid', 401));
        }
        return next(error);
    }
};
