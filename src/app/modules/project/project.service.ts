import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';

export class ProjectService {
  static async createReview(projectId: string, userId: string, ratings: Record<string, number>, commentData?: { content: string; type?: 'ROAST' | 'TOAST' }) {
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

    let createdRating;
    try {
      createdRating = await prisma.rating.create({
        data: {
          projectId,
          userId,
          vibes: ratings.vibes,
          creativity: ratings.creativity,
          usefulness: ratings.usefulness,
          cursedness: ratings.cursedness,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Unique constraint violation when creating rating', 409);
      }
      throw error;
    }

    let createdComment = null;
    if (commentData && commentData.content.trim().length > 0) {
      createdComment = await prisma.comment.create({
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
  }

  static async createProject(data: {
    authorId: string;
    title: string;
    description: string;
    promptUsed: string;
    siteUrl?: string;
    repoUrl?: string;
    screenshot?: string;
    tags?: string[];
  }) {
    const author = await prisma.user.findUnique({ where: { id: data.authorId } });
    if (!author) {
      throw new AppError('Author not found', 404);
    }

    const createdProject = await prisma.project.create({
      data: {
        authorId: data.authorId,
        title: data.title.trim(),
        description: data.description.trim(),
        promptUsed: data.promptUsed.trim(),
        siteUrl: data.siteUrl?.trim() || undefined,
        repoUrl: data.repoUrl?.trim() || undefined,
        screenshot: data.screenshot?.trim() || undefined,
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
  }
}
