import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service.js';
import { sendSuccess } from '../../lib/response.js';
import { catchAsync } from '../../lib/catchAsync.js';
import { AppError } from '../../lib/AppError.js';

export class ProjectController {
  static createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const userId = (req as any).userId as string;
    const { rating, comment } = req.body;

    if (!userId) {
      throw new AppError('Authentication required: cannot access userId', 401);
    }

    const created = await ProjectService.createReview(projectId, userId, rating, comment);
    sendSuccess(res, 'Review created successfully', created, 201);
  });

  static createProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).userId as string;

    if (!userId) {
      throw new AppError('Authentication required: cannot access userId', 401);
    }

    const data = {
      authorId: userId,
      title: req.body.title,
      description: req.body.description,
      promptUsed: req.body.promptUsed,
      siteUrl: req.body.siteUrl,
      repoUrl: req.body.repoUrl,
      screenshot: req.body.screenshot,
      tags: req.body.tags,
    };

    const created = await ProjectService.createProject(data);
    sendSuccess(res, 'Project created successfully', created, 201);
  });
}
