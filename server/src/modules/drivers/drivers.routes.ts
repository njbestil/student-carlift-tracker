import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate-request.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { driversController } from './drivers.controller.js';
import { upsertDriverProfileSchema } from './drivers.schema.js';

export const driversRouter = Router();

driversRouter.get('/me', authenticate, asyncHandler(driversController.getMe));
driversRouter.patch(
  '/me',
  authenticate,
  validateBody(upsertDriverProfileSchema),
  asyncHandler(driversController.upsertMe),
);
