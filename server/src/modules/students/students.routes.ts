import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate-request.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { studentsController } from './students.controller.js';
import { upsertStudentProfileSchema } from './students.schema.js';

export const studentsRouter = Router();

studentsRouter.get('/me', authenticate, asyncHandler(studentsController.getMe));
studentsRouter.patch(
  '/me',
  authenticate,
  validateBody(upsertStudentProfileSchema),
  asyncHandler(studentsController.upsertMe),
);
