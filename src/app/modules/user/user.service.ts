import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { deleteImage } from '../../lib/cloudinary.js';
import type { Rating, Comment, Prisma } from '../../../generated/prisma/client.js';

type UpdateProfileData = {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    avatarPublicId?: string;
};

type RatingWithProject = Rating & {
    project: {
        id: string;
        title: string;
        screenshot: string | null;
    };
};

type CommentWithProject = Comment & {
    project: {
        id: string;
        title: string;
        screenshot: string | null;
    };
};

export class UserService {
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                bio: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    static async updateProfile(userId: string, data: UpdateProfileData) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new AppError('User not found', 404);
            }

            // If new avatar is provided, delete the old one
            if (data.avatarPublicId && user.avatarPublicId && data.avatarPublicId !== user.avatarPublicId) {
                try {
                    await deleteImage(user.avatarPublicId);
                } catch (error) {
                    console.error('Failed to delete old avatar from cloudinary:', error);
                }
            }

            const updateData: any = {};
            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null;
            if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl?.trim() || null;
            if (data.avatarPublicId !== undefined) updateData.avatarPublicId = data.avatarPublicId?.trim() || null;

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                    createdAt: true,
                },
            });

            return updatedUser;
        });
    }

    static async getUserProjects(userId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where: { authorId: userId },
                include: {
                    tags: true,
                    ratings: true,
                    comments: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.project.count({ where: { authorId: userId } }),
        ]);

        return {
            projects,
            total,
            page,
            limit,
        };
    }

    static async getUserActivity(userId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        // Get all ratings and comments (without pagination)
        const [ratings, comments] = await Promise.all([
            prisma.rating.findMany({
                where: { userId },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            screenshot: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.comment.findMany({
                where: { userId },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            screenshot: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        // Combine and sort by createdAt
        const activity = [
            ...ratings.map((r: RatingWithProject) => ({ activityType: 'rating', ...r })),
            ...comments.map((c: CommentWithProject) => ({ activityType: 'comment', ...c })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Paginate the combined activity
        const total = activity.length;
        const paginatedActivity = activity.slice(skip, skip + limit);

        return {
            activity: paginatedActivity,
            total,
            page,
            limit,
        };
    }
}