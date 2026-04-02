import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service.js';
import { sendSuccess } from '../../lib/response.js';
import { catchAsync } from '../../lib/catchAsync.js';

export class ProjectController {
  static createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const userId = Array.isArray(req.body.userId) ? req.body.userId[0] : req.body.userId;
    const { rating, comment } = req.body;

    const created = await ProjectService.createReview(projectId, userId, rating, comment);
    sendSuccess(res, 'Review created successfully', created, 201);
  });
}
