import type { RequestHandler } from 'express';
import { AppError } from '../../utils/app-error.js';
import { studentsService } from './students.service.js';

export const studentsController = {
  getMe: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await studentsService.getMe(request.user.id);
    response.json({ profile });
  }) satisfies RequestHandler,

  getAssignedDriver: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const driver = await studentsService.getAssignedDriver(request.user.id, request.user.role);
    response.json({ driver });
  }) satisfies RequestHandler,

  upsertMe: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await studentsService.upsertMe(request.user.id, request.user.role, request.body);
    response.json({ profile });
  }) satisfies RequestHandler,

  updateServiceStatus: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await studentsService.updateServiceStatus(
      String(request.params.userId),
      request.user.id,
      request.user.role,
      request.body,
    );
    response.json({ profile });
  }) satisfies RequestHandler,
};
