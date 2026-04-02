import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from './user.controller.js';
import { updateProfileSchema, getUserProjectsSchema, getUserActivitySchema } from './user.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import multer from 'multer';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({ params: req.params, body: req.body, query: req.query });
        next();
    } catch (error: any) {
        res.status(422).json({ message: 'Validation error', errors: error.errors });
    }
};

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, upload.single('avatar'), validate(updateProfileSchema), UserController.updateProfile);
router.get('/projects', authenticate, validate(getUserProjectsSchema), UserController.getUserProjects);
router.get('/activity', authenticate, validate(getUserActivitySchema), UserController.getUserActivity);

export default router;