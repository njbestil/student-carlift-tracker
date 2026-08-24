import type { RequestHandler } from 'express';
import type { UserRole } from '../constants/roles.js';
import { AppError } from '../utils/app-error.js';

export const authorize =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (request, _response, next) => {
    if (!request.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(new AppError('You do not have access to this resource', 403));
    }

    return next();
  };
