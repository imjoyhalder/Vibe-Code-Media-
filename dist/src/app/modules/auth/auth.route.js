import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validation.js';
const router = Router();
// Middleware to validate request
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({ body: req.body });
        next();
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
};
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
export default router;
