import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess } from '../../lib/response.js';
import { catchAsync } from '../../lib/catchAsync.js';
import { AppError } from '../../lib/AppError.js';
import { uploadImage } from '../../lib/cloudinary.js';

export class UserController {
    static getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).userId as string;

        if (!userId) {
            throw new AppError('Authentication required', 401);
        }

        const profile = await UserService.getProfile(userId);
        sendSuccess(res, 'Profile retrieved successfully', profile);
    });

    static updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).userId as string;

        if (!userId) {
            throw new AppError('Authentication required', 401);
        }

        let avatarUrl: string | undefined;
        let avatarPublicId: string | undefined;
        const file = (req as any).file as { buffer: Buffer; mimetype: string } | undefined;
        if (file) {
            const uploadResult = await uploadImage(file.buffer, 'user-avatars');
            avatarUrl = uploadResult.url;
            avatarPublicId = uploadResult.publicId;
        }

        const data = {
            name: req.body.name,
            bio: req.body.bio,
            avatarUrl,
            avatarPublicId,
        };

        const updatedProfile = await UserService.updateProfile(userId, data);
        sendSuccess(res, 'Profile updated successfully', updatedProfile);
    });

    static getUserProjects = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).userId as string;

        if (!userId) {
            throw new AppError('Authentication required', 401);
        }

        const { page = 1, limit = 10 } = req.query as any;
        const result = await UserService.getUserProjects(userId, page, limit);
        sendSuccess(res, 'User projects retrieved successfully', result);
    });

    static getUserActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).userId as string;

        if (!userId) {
            throw new AppError('Authentication required', 401);
        }

        const { page = 1, limit = 10 } = req.query as any;
        const result = await UserService.getUserActivity(userId, page, limit);
        sendSuccess(res, 'User activity retrieved successfully', result);
    });
}