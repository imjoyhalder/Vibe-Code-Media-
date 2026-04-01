import { Router } from 'express';
import authRouter from '../modules/auth/auth.route.js';
import { sendSuccess } from '../lib/response.js';

const router = Router();

// Mount auth routes
router.use('/auth', authRouter);

// Health check
router.get('/health', (req, res) => {
  sendSuccess(res, 'API is healthy', {
    timestamp: new Date().toISOString(),
  });
});

export default router;
