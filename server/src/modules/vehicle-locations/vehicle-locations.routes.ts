import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate-request.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { createVehicleLocationSchema } from './vehicle-locations.schema.js';
import { vehicleLocationsController } from './vehicle-locations.controller.js';

export const vehicleLocationsRouter = Router();

vehicleLocationsRouter.post(
  '/',
  authenticate,
  validateBody(createVehicleLocationSchema),
  asyncHandler(vehicleLocationsController.create),
);
vehicleLocationsRouter.get(
  '/my-driver/latest',
  authenticate,
  asyncHandler(vehicleLocationsController.latestForAssignedDriver),
);
vehicleLocationsRouter.get('/latest/:driverId', authenticate, asyncHandler(vehicleLocationsController.latest));
