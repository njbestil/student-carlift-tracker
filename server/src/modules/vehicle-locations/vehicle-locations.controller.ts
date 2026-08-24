import type { RequestHandler } from 'express';
import { AppError } from '../../utils/app-error.js';
import { vehicleLocationsService } from './vehicle-locations.service.js';

export const vehicleLocationsController = {
  create: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const location = await vehicleLocationsService.create(request.user.id, request.user.role, request.body);
    response.status(201).json({ location });
  }) satisfies RequestHandler,

  latest: (async (request, response) => {
    const location = await vehicleLocationsService.latest(String(request.params.driverId));
    response.json({ location });
  }) satisfies RequestHandler,
};
