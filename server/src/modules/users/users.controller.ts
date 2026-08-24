import type { RequestHandler } from 'express';
import { AppError } from '../../utils/app-error.js';
import { usersService } from './users.service.js';

const requireUserId = (userId: string | undefined) => {
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  return userId;
};

export const usersController = {
  getMe: (async (request, response) => {
    const user = await usersService.getMe(requireUserId(request.user?.id));
    response.json({ user });
  }) satisfies RequestHandler,

  updateMe: (async (request, response) => {
    const user = await usersService.updateMe(requireUserId(request.user?.id), request.body);
    response.json({ user });
  }) satisfies RequestHandler,
};
