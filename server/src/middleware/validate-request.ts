import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/app-error.js';

export const validateBody =
  <TSchema>(schema: ZodType<TSchema>) =>
  (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return next(new AppError('Request validation failed', 400, result.error.flatten().fieldErrors));
    }

    request.body = result.data;
    return next();
  };
