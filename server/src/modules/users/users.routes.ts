import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate-request.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { usersController } from './users.controller.js';
import { updateUserSchema } from './users.schema.js';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, asyncHandler(usersController.getMe));
usersRouter.patch('/me', authenticate, validateBody(updateUserSchema), asyncHandler(usersController.updateMe));
