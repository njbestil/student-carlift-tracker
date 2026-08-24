import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (request: Request, response: Response, next: NextFunction) => Promise<void>;

export const asyncHandler =
  (handler: AsyncRouteHandler) => (request: Request, response: Response, next: NextFunction) => {
    void handler(request, response, next).catch(next);
  };
