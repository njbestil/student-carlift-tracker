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

  getDashboard: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const dashboard = await driversService.getDashboard(request.user.id, request.user.role);
    response.json(dashboard);
  }) satisfies RequestHandler,

  upsertMe: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await driversService.upsertMe(request.user.id, request.user.role, request.body);
    response.json({ profile });
  }) satisfies RequestHandler,

  updateServiceStatus: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await driversService.updateServiceStatus(request.user.id, request.user.role, request.body);
    response.json({ profile });
  }) satisfies RequestHandler,

  startTrip: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const trip = await driversService.startTrip(request.user.id, request.user.role, request.body);
    response.status(201).json({ trip });
  }) satisfies RequestHandler,

  updateTripStudentStatus: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const result = await driversService.updateTripStudentStatus(
      request.user.id,
      request.user.role,
      String(request.params.userId),
      request.body,
    );
    response.json(result);
  }) satisfies RequestHandler,

  cancelActiveTrip: (async (request, response) => {
    if (!request.user) {
      throw new AppError('Authentication required', 401);
    }

    const trip = await driversService.cancelActiveTrip(request.user.id, request.user.role);
    response.json({ trip });
  }) satisfies RequestHandler,
};
