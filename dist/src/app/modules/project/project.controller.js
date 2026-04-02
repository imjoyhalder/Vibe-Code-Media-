import { ProjectService } from './project.service.js';
import { sendSuccess } from '../../lib/response.js';
import { catchAsync } from '../../lib/catchAsync.js';
import { AppError } from '../../lib/AppError.js';
import { uploadImage } from '../../lib/cloudinary.js';
export class ProjectController {
    static createReview = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const userId = req.userId;
        const { rating, comment } = req.body;
        if (!userId) {
            throw new AppError('Authentication required: cannot access userId', 401);
        }
        const created = await ProjectService.createReview(projectId, userId, rating, comment);
        sendSuccess(res, 'Review created successfully', created, 201);
    });
    static createProject = catchAsync(async (req, res, next) => {
        const userId = req.userId;
        if (!userId) {
            throw new AppError('Authentication required: cannot access userId', 401);
        }
        let screenshotUrl;
        let screenshotPublicId;
        const file = req.file;
        if (file) {
            const uploadResult = await uploadImage(file.buffer, 'vibecode-projects');
            screenshotUrl = uploadResult.url;
            screenshotPublicId = uploadResult.publicId;
        }
        const data = {
            authorId: userId,
            title: req.body.title,
            description: req.body.description,
            promptUsed: req.body.promptUsed,
            siteUrl: req.body.siteUrl,
            repoUrl: req.body.repoUrl,
            screenshot: screenshotUrl,
            screenshotPublicId,
            tags: req.body.tags,
        };
        const created = await ProjectService.createProject(data);
        sendSuccess(res, 'Project created successfully', created, 201);
    });
    static updateProject = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const userId = req.userId;
        if (!userId) {
            throw new AppError('Authentication required: cannot access userId', 401);
        }
        let screenshotUrl;
        let screenshotPublicId;
        const file = req.file;
        if (file) {
            const uploadResult = await uploadImage(file.buffer, 'vibecode-projects');
            screenshotUrl = uploadResult.url;
            screenshotPublicId = uploadResult.publicId;
        }
        const data = {
            ...req.body,
            screenshot: screenshotUrl,
            screenshotPublicId,
        };
        const updated = await ProjectService.updateProject(projectId, userId, data);
        sendSuccess(res, 'Project updated successfully', updated);
    });
    static deleteProject = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const userId = req.userId;
        if (!userId) {
            throw new AppError('Authentication required: cannot access userId', 401);
        }
        const result = await ProjectService.deleteProject(projectId, userId);
        sendSuccess(res, result.message);
    });
    static getProjectReviews = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const reviews = await ProjectService.getProjectReviews(projectId);
        sendSuccess(res, 'Reviews retrieved successfully', reviews);
    });
    static createRating = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const userId = req.userId;
        if (!userId) {
            throw new AppError('Authentication required: cannot access userId', 401);
        }
        const ratingData = req.body;
        const created = await ProjectService.createRating(projectId, userId, ratingData);
        sendSuccess(res, 'Rating created successfully', created, 201);
    });
    static getProjectRatings = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const ratings = await ProjectService.getProjectRatings(projectId);
        sendSuccess(res, 'Ratings retrieved successfully', ratings);
    });
    static getProjectComments = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const comments = await ProjectService.getProjectComments(projectId);
        sendSuccess(res, 'Comments retrieved successfully', comments);
    });
    static getProjects = catchAsync(async (req, res, next) => {
        const filters = req.query;
        const result = await ProjectService.getProjects(filters);
        sendSuccess(res, 'Projects retrieved successfully', result);
    });
    static getProjectById = catchAsync(async (req, res, next) => {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const project = await ProjectService.getProjectById(projectId);
        sendSuccess(res, 'Project retrieved successfully', project);
    });
    static getAverageVibeScores = catchAsync(async (req, res, next) => {
        const averages = await ProjectService.getAverageVibeScores();
        sendSuccess(res, 'Average vibe scores retrieved successfully', averages);
    });
}
