import { Router } from 'express';
import { validateBody } from '../../middleware/validate-request.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { authController } from './auth.controller.js';
import { forgotPasswordSchema, loginSchema, registerSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), asyncHandler(authController.register));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(authController.login));
authRouter.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);
