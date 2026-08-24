import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { environment } from '../config/environment.js';
import { AppError } from '../utils/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        message: 'Request validation failed',
        details: error.flatten().fieldErrors,
      },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: {
      message: 'Internal server error',
      ...(environment.NODE_ENV === 'development' ? { details: String(error) } : {}),
    },
  });
};
