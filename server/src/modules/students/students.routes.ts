import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody, validateParams } from '../../middleware/validate-request.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { studentsController } from './students.controller.js';
import {
  serviceStatusUpdateSchema,
  studentUserIdParamsSchema,
  upsertStudentProfileSchema,
} from './students.schema.js';

export const studentsRouter = Router();

studentsRouter.get('/me', authenticate, asyncHandler(studentsController.getMe));
studentsRouter.get('/me/driver', authenticate, asyncHandler(studentsController.getAssignedDriver));
studentsRouter.patch(
  '/me',
  authenticate,
  validateBody(upsertStudentProfileSchema),
  asyncHandler(studentsController.upsertMe),
);
studentsRouter.patch(
  '/:userId/service-status',
  authenticate,
  validateParams(studentUserIdParamsSchema),
  validateBody(serviceStatusUpdateSchema),
  asyncHandler(studentsController.updateServiceStatus),
);
