import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { deleteImage } from '../../lib/cloudinary.js';
export class ProjectService {
    static async createProject(data) {
        return await prisma.$transaction(async (tx) => {
            const author = await tx.user.findUnique({ where: { id: data.authorId } });
            if (!author) {
                throw new AppError('Author not found', 404);
            }
            const createdProject = await tx.project.create({
                data: {
                    authorId: data.authorId,
                    title: data.title.trim(),
                    description: data.description.trim(),
                    promptUsed: data.promptUsed.trim(),
                    siteUrl: data.siteUrl?.trim() || undefined,
                    repoUrl: data.repoUrl?.trim() || undefined,
                    screenshot: data.screenshot?.trim() || undefined,
                    screenshotPublicId: data.screenshotPublicId?.trim() || undefined,
                    tags: data.tags
                        ? {
                            connectOrCreate: data.tags.map((tag) => ({
                                where: { name: tag.trim() },
                                create: { name: tag.trim() },
                            })),
                        }
                        : undefined,
                },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    tags: true,
                },
            });
            return createdProject;
        });
    }
    static async createReview(projectId, userId, ratings, commentData) {
        return await prisma.$transaction(async (tx) => {
            const project = await tx.project.findUnique({ where: { id: projectId } });
            if (!project) {
                throw new AppError('Project not found', 404);
            }
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new AppError('User not found', 404);
            }
            const existingRating = await tx.rating.findUnique({
                where: {
                    userId_projectId: {
                        userId,
                        projectId,
                    },
                },
            });
            if (existingRating) {
                throw new AppError('You have already rated this project', 409);
            }
            let createdRating;
            try {
                createdRating = await tx.rating.create({
                    data: {
                        projectId,
                        userId,
                        vibes: ratings.vibes,
                        creativity: ratings.creativity,
                        usefulness: ratings.usefulness,
                        cursedness: ratings.cursedness,
                    },
                });
            }
            catch (error) {
                if (error.code === 'P2002') {
                    throw new AppError('Unique constraint violation when creating rating', 409);
                }
                throw error;
            }
            let createdComment = null;
            if (commentData && commentData.content.trim().length > 0) {
                createdComment = await tx.comment.create({
                    data: {
                        projectId,
                        userId,
                        content: commentData.content.trim(),
                        type: commentData.type ?? 'TOAST',
                    },
                });
            }
            return {
                projectId,
                userId,
                rating: createdRating,
                comment: createdComment,
            };
        });
    }
    static async updateProject(projectId, userId, data) {
        return await prisma.$transaction(async (tx) => {
            const project = await tx.project.findUnique({
                where: { id: projectId },
                include: { author: true },
            });
            if (!project) {
                throw new AppError('Project not found', 404);
            }
            if (project.authorId !== userId) {
                throw new AppError('Unauthorized: only the project owner can update this project', 403);
            }
            // If new screenshot is provided, delete the old one
            if (data.screenshotPublicId && project.screenshotPublicId && data.screenshotPublicId !== project.screenshotPublicId) {
                try {
                    await deleteImage(project.screenshotPublicId);
                }
                catch (error) {
                    console.error('Failed to delete old screenshot from cloudinary:', error);
                }
            }
            const updateData = {};
            if (data.title !== undefined)
                updateData.title = data.title.trim();
            if (data.description !== undefined)
                updateData.description = data.description.trim();
            if (data.promptUsed !== undefined)
                updateData.promptUsed = data.promptUsed.trim();
            if (data.siteUrl !== undefined)
                updateData.siteUrl = data.siteUrl?.trim() || null;
            if (data.repoUrl !== undefined)
                updateData.repoUrl = data.repoUrl?.trim() || null;
            if (data.screenshot !== undefined)
                updateData.screenshot = data.screenshot?.trim() || null;
            if (data.screenshotPublicId !== undefined)
                updateData.screenshotPublicId = data.screenshotPublicId?.trim() || null;
            if (data.tags !== undefined) {
                updateData.tags = {
                    set: [], // Clear existing tags
                    connectOrCreate: data.tags.map((tag) => ({
                        where: { name: tag.trim() },
                        create: { name: tag.trim() },
                    })),
                };
            }
            const updatedProject = await tx.project.update({
                where: { id: projectId },
                data: updateData,
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    tags: true,
                },
            });
            return updatedProject;
        });
    }
    static async deleteProject(projectId, userId) {
        return await prisma.$transaction(async (tx) => {
            const project = await tx.project.findUnique({
                where: { id: projectId },
                include: { author: true },
            });
            if (!project) {
                throw new AppError('Project not found', 404);
            }
            if (project.authorId !== userId) {
                throw new AppError('Unauthorized: only the project owner can delete this project', 403);
            }
            // Delete related ratings and comments explicitly for safety
            await tx.rating.deleteMany({ where: { projectId } });
            await tx.comment.deleteMany({ where: { projectId } });
            // Delete the project (tags will be disconnected due to cascade)
            await tx.project.delete({ where: { id: projectId } });
            // If screenshotPublicId exists, delete from cloudinary
            if (project.screenshotPublicId) {
                try {
                    await deleteImage(project.screenshotPublicId);
                }
                catch (error) {
                    // Log but don't fail the deletion
                    console.error('Failed to delete screenshot from cloudinary:', error);
                }
            }
            return { message: 'Project deleted successfully' };
        });
    }
    static async getProjectReviews(projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new AppError('Project not found', 404);
        }
        const ratings = await prisma.rating.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });
        const comments = await prisma.comment.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            projectId,
            ratings,
            comments,
        };
    }
    static async createRating(projectId, userId, ratingData) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new AppError('Project not found', 404);
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        const existingRating = await prisma.rating.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId,
                },
            },
        });
        if (existingRating) {
            throw new AppError('You have already rated this project', 409);
        }
        const createdRating = await prisma.rating.create({
            data: {
                projectId,
                userId,
                vibes: ratingData.vibes,
                creativity: ratingData.creativity,
                usefulness: ratingData.usefulness,
                cursedness: ratingData.cursedness,
            },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });
        return createdRating;
    }
    static async getProjectRatings(projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new AppError('Project not found', 404);
        }
        const ratings = await prisma.rating.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });
        return ratings;
    }
    static async getProjectComments(projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new AppError('Project not found', 404);
        }
        const comments = await prisma.comment.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return comments;
    }
    static async getProjects(filters) {
        const { tag, sort, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        let where = {};
        if (tag) {
            where.tags = {
                some: {
                    name: tag,
                },
            };
        }
        let orderBy = { createdAt: 'desc' };
        if (sort === 'vibeScore') {
            // For sorting by vibeScore, we need to compute average
            // Since Prisma doesn't support complex aggregations in findMany, we'll fetch and sort in JS
            const projects = await prisma.project.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    tags: true,
                    ratings: true,
                },
            });
            const projectsWithScores = projects.map((project) => {
                const ratings = project.ratings;
                const avgVibes = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.vibes, 0) / ratings.length : 0;
                const avgCreativity = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.creativity, 0) / ratings.length : 0;
                const avgUsefulness = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.usefulness, 0) / ratings.length : 0;
                const avgCursedness = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.cursedness, 0) / ratings.length : 0;
                const vibeScore = (avgVibes + avgCreativity + avgUsefulness + avgCursedness) / 4;
                return { ...project, vibeScore };
            });
            projectsWithScores.sort((a, b) => b.vibeScore - a.vibeScore);
            const paginated = projectsWithScores.slice(skip, skip + limit);
            return {
                projects: paginated,
                total: projects.length,
                page,
                limit,
            };
        }
        else {
            const [projects, total] = await Promise.all([
                prisma.project.findMany({
                    where,
                    include: {
                        author: { select: { id: true, name: true, email: true } },
                        tags: true,
                        ratings: true,
                    },
                    orderBy,
                    skip,
                    take: limit,
                }),
                prisma.project.count({ where }),
            ]);
            return {
                projects,
                total,
                page,
                limit,
            };
        }
    }
    static async getProjectById(projectId) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                author: { select: { id: true, name: true, email: true } },
                tags: true,
                ratings: {
                    include: {
                        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                    },
                },
                comments: {
                    include: {
                        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!project) {
            throw new AppError('Project not found', 404);
        }
        return project;
    }
    static async getAverageVibeScores() {
        const aggregations = await prisma.rating.aggregate({
            _avg: {
                vibes: true,
                creativity: true,
                usefulness: true,
                cursedness: true,
            },
        });
        return {
            vibes: aggregations._avg.vibes || 0,
            creativity: aggregations._avg.creativity || 0,
            usefulness: aggregations._avg.usefulness || 0,
            cursedness: aggregations._avg.cursedness || 0,
        };
    }
}
