import type { RequestHandler } from 'express';
import { authService } from './auth.service.js';

export const authController = {
  register: (async (request, response) => {
    const result = await authService.register(request.body);
    response.status(201).json(result);
  }) satisfies RequestHandler,

  login: (async (request, response) => {
    const result = await authService.login(request.body);
    response.json(result);
  }) satisfies RequestHandler,

  forgotPassword: (async (_request, response) => {
    const result = await authService.forgotPassword();
    response.json(result);
  }) satisfies RequestHandler,
};
