import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody, validateParams } from '../../middleware/validate-request.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { driversController } from './drivers.controller.js';
import {
  startDriverTripSchema,
  tripStudentParamsSchema,
  updateDriverServiceStatusSchema,
  updateTripStudentStatusSchema,
  upsertDriverProfileSchema,
} from './drivers.schema.js';

export const driversRouter = Router();

driversRouter.get('/me', authenticate, asyncHandler(driversController.getMe));
driversRouter.get('/me/dashboard', authenticate, asyncHandler(driversController.getDashboard));
driversRouter.patch(
  '/me/service-status',
  authenticate,
  validateBody(updateDriverServiceStatusSchema),
  asyncHandler(driversController.updateServiceStatus),
);
driversRouter.post(
  '/me/trips',
  authenticate,
  validateBody(startDriverTripSchema),
  asyncHandler(driversController.startTrip),
);
driversRouter.patch(
  '/me/trips/students/:userId/status',
  authenticate,
  validateParams(tripStudentParamsSchema),
  validateBody(updateTripStudentStatusSchema),
  asyncHandler(driversController.updateTripStudentStatus),
);
driversRouter.patch(
  '/me',
  authenticate,
  validateBody(upsertDriverProfileSchema),
  asyncHandler(driversController.upsertMe),
);
