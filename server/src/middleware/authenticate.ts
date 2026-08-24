import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { environment } from '../config/environment.js';
import { AppError } from '../utils/app-error.js';
import { authRepository } from '../modules/auth/auth.repository.js';

type JwtPayload = {
  sub: string;
};

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const authorization = request.header('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = jwt.verify(token, environment.JWT_SECRET) as JwtPayload;
    const user = await authRepository.findPublicUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new AppError('Authentication required', 401);
    }

    request.user = {
      id: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
      profileCompleted: user.profileCompleted,
    };

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Authentication required', 401));
  }
};
