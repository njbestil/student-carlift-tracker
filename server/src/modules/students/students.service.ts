import { AppError } from '../../utils/app-error.js';
import { studentDriverAssignmentsRepository } from '../student-driver-assignments/student-driver-assignments.repository.js';
import { driversService } from '../drivers/drivers.service.js';
import { studentsRepository } from './students.repository.js';
import type { ServiceStatusUpdateInput, UpsertStudentProfileInput } from './students.schema.js';

export const studentsService = {
  async getMe(userId: string) {
    return studentsRepository.findByUserId(userId);
  },

  async getAssignedDriver(userId: string, role: string) {
    if (role !== 'STUDENT') {
      throw new AppError('Only student accounts can view their assigned driver', 403);
    }

    const driver = await studentsRepository.findAssignedDriverDetails(userId);

    if (!driver) {
      throw new AppError('No driver assigned to this student', 404);
    }

    return driver;
  },

  async upsertMe(userId: string, role: string, input: UpsertStudentProfileInput) {
    if (role !== 'STUDENT') {
      throw new AppError('Only student accounts can update student profiles', 403);
    }

    const profile = await studentsRepository.upsert(userId, input);
    await studentsRepository.markProfileCompleted(userId);
    await studentDriverAssignmentsRepository.assignStudentToStaticDriver(userId);
    return profile;
  },

  async updateServiceStatus(
    userId: string,
    driverUserId: string,
    role: string,
    input: ServiceStatusUpdateInput,
  ) {
    if (role !== 'DRIVER') {
      throw new AppError('Only drivers can update student service statuses', 403);
    }

    const result = await driversService.updateTripStudentStatus(driverUserId, role, userId, input);
    return result.student;
  },
};
