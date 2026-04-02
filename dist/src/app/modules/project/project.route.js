import { Router } from 'express';
import { ProjectController } from './project.controller.js';
import { createProjectSchema, createProjectReviewSchema, updateProjectSchema, createRatingSchema, getProjectsSchema } from './project.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import multer from 'multer';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({ params: req.params, body: req.body, query: req.query });
        next();
    }
    catch (error) {
        res.status(422).json({ message: 'Validation error', errors: error.errors });
    }
};
router.get('/', validate(getProjectsSchema), ProjectController.getProjects);
router.get('/averages', ProjectController.getAverageVibeScores);
router.post('/', authenticate, upload.single('screenshot'), validate(createProjectSchema), ProjectController.createProject);
router.get('/:projectId', ProjectController.getProjectById);
router.put('/:projectId', authenticate, upload.single('screenshot'), validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/:projectId', authenticate, ProjectController.deleteProject);
router.post('/:projectId/review', authenticate, validate(createProjectReviewSchema), ProjectController.createReview);
router.get('/:projectId/reviews', ProjectController.getProjectReviews);
router.post('/:projectId/ratings', authenticate, validate(createRatingSchema), ProjectController.createRating);
router.get('/:projectId/ratings', ProjectController.getProjectRatings);
router.get('/:projectId/comments', ProjectController.getProjectComments);
export default router;
