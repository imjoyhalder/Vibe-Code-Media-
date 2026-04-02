import { NextFunction, Request, Response, Router } from 'express';
import { ProjectController } from './project.controller.js';
import { createProjectSchema, createProjectReviewSchema } from './project.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ params: req.params, body: req.body });
    next();
  } catch (error: any) {
    res.status(400).json({ message: 'Validation error', errors: error.errors });
  }
};

router.post('/', authenticate, validate(createProjectSchema), ProjectController.createProject);
router.post('/:projectId/review', authenticate, validate(createProjectReviewSchema), ProjectController.createReview);

export default router;
