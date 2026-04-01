import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterRequest, LoginRequest } from './auth.interfacet.js';
import { sendSuccess } from '../../lib/response.js';
import { catchAsync } from '../../lib/catchAsync.js';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: RegisterRequest = req.body;
    const result = await AuthService.register(data);
    sendSuccess(res, 'User registered successfully', result, 201);
  });

  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: LoginRequest = req.body;
    const result = await AuthService.login(data);
    sendSuccess(res, 'Login successful', result);
  });
}
