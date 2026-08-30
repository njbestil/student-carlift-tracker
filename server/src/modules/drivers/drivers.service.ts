import { AppError } from '../../utils/app-error.js';
import { studentDriverAssignmentsRepository } from '../student-driver-assignments/student-driver-assignments.repository.js';
import { driversRepository } from './drivers.repository.js';
import type {
  StartDriverTripInput,
  UpdateDriverServiceStatusInput,
  UpdateTripStudentStatusInput,
  UpsertDriverProfileInput,
} from './drivers.schema.js';

export const driversService = {
  async getMe(userId: string) {
    return driversRepository.findByUserId(userId);
  },

  async getDashboard(userId: string, role: string) {
    if (role !== 'DRIVER') {
      throw new AppError('Only driver accounts can view the driver dashboard', 403);
    }

    const [profile, activeTrip] = await Promise.all([
      driversRepository.findByUserId(userId),
      driversRepository.findActiveTrip(userId),
    ]);
    const students = activeTrip
      ? await driversRepository.findTripStudents(activeTrip.id, userId)
      : await driversRepository.findAssignedStudents(userId);

    return { profile, activeTrip, students };
  },

  async upsertMe(userId: string, role: string, input: UpsertDriverProfileInput) {
    if (role !== 'DRIVER') {
      throw new AppError('Only driver accounts can update driver profiles', 403);
    }

    const profile = await driversRepository.upsert(userId, input);
    await driversRepository.markProfileCompleted(userId);
    await studentDriverAssignmentsRepository.assignAllStudentsToStaticDriver();
    return profile;
  },

  async updateServiceStatus(userId: string, role: string, input: UpdateDriverServiceStatusInput) {
    if (role !== 'DRIVER') {
      throw new AppError('Only driver accounts can update service status', 403);
    }

    const profile = await driversRepository.updateServiceStatus(userId, input);

    if (!profile) {
      throw new AppError('Driver profile not found', 404);
    }

    return profile;
  },

  async startTrip(userId: string, role: string, input: StartDriverTripInput) {
    if (role !== 'DRIVER') {
      throw new AppError('Only driver accounts can start a trip', 403);
    }

    const [activeTrip, assignedStudents] = await Promise.all([
      driversRepository.findActiveTrip(userId),
      driversRepository.findAssignedStudents(userId),
    ]);

    if (activeTrip) {
      throw new AppError('Complete the current trip before starting another one', 409);
    }

    if (!assignedStudents.length) {
      throw new AppError('No students are assigned to this driver', 400);
    }

    try {
      return await driversRepository.startTrip(userId, input);
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
        throw new AppError('Complete the current trip before starting another one', 409);
      }
      throw error;
    }
  },

  async updateTripStudentStatus(
    driverUserId: string,
    role: string,
    studentUserId: string,
    input: UpdateTripStudentStatusInput,
  ) {
    if (role !== 'DRIVER') {
      throw new AppError('Only driver accounts can update student service statuses', 403);
    }

    const result = await driversRepository.transitionTripStudentStatus(driverUserId, studentUserId, input);

    if (result.kind === 'no_active_trip') {
      throw new AppError('Start a trip before updating student statuses', 409);
    }

    if (result.kind === 'student_not_in_trip') {
      throw new AppError('This student is not part of the active trip', 403);
    }

    if (result.kind === 'invalid_transition') {
      throw new AppError(`Cannot change a ${result.currentStatus} student to ${input.serviceStatus}`, 409);
    }

    return result;
  },

  async cancelActiveTrip(userId: string, role: string) {
    if (role !== 'DRIVER') {
      throw new AppError('Only driver accounts can cancel trips', 403);
    }

    const result = await driversRepository.cancelActiveTrip(userId);

    if (result.kind === 'no_active_trip') {
      throw new AppError('There is no active trip to cancel', 409);
    }

    if (result.kind === 'riders_not_all_absent') {
      throw new AppError('Mark every rider absent before cancelling the trip', 409);
    }

    return result.trip;
  },
};
