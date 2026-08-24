import { Router } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { asyncHandler } from '../utils/async-handler.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { driversRouter } from '../modules/drivers/drivers.routes.js';
import { studentsRouter } from '../modules/students/students.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { vehicleLocationsRouter } from '../modules/vehicle-locations/vehicle-locations.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'student-carlift-tracker-api' });
});

apiRouter.get(
  '/database-health',
  asyncHandler(async (_request, response) => {
    const database = await checkDatabaseHealth();
    response.json({ status: 'ok', database });
  }),
);

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/students', studentsRouter);
apiRouter.use('/drivers', driversRouter);
apiRouter.use('/vehicle-locations', vehicleLocationsRouter);
