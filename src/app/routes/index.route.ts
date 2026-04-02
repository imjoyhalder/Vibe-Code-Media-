import { Request, Response, Router } from 'express';
import authRouter from '../modules/auth/auth.route.js';
import projectRouter from '../modules/project/project.route.js';
import userRouter from '../modules/user/user.route.js';
import { sendSuccess } from '../lib/response.js';

const router = Router();

// Mount auth routes
router.use('/auth', authRouter);

// Mount project review route
router.use('/projects', projectRouter);

// Mount user routes
router.use('/users', userRouter);

// Health check
router.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, 'API is healthy', {
    timestamp: new Date().toISOString(),
  });
});

export default router;
