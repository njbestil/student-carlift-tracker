import type { RequestHandler } from 'express';
import { AppError } from '../../utils/app-error.js';
import { driversService } from './drivers.service.js';

export const driversController = {
  getMe: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await driversService.getMe(request.user.id);
    response.json({ profile });
  }) satisfies RequestHandler,

  upsertMe: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await driversService.upsertMe(request.user.id, request.user.role, request.body);
    response.json({ profile });
  }) satisfies RequestHandler,
};
