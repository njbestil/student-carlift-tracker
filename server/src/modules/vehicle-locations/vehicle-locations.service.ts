import { AppError } from '../../utils/app-error.js';
import { studentDriverAssignmentsRepository } from '../student-driver-assignments/student-driver-assignments.repository.js';
import { vehicleLocationsRepository } from './vehicle-locations.repository.js';
import type { CreateVehicleLocationInput } from './vehicle-locations.schema.js';

export const vehicleLocationsService = {
  async create(driverId: string, role: string, input: CreateVehicleLocationInput) {
    if (role !== 'DRIVER') {
      throw new AppError('Only drivers can submit vehicle locations', 403);
    }

    return vehicleLocationsRepository.create(driverId, input);
  },

  async latestForViewer(viewerId: string, role: string, driverId: string) {
    if (role === 'ADMIN' || (role === 'DRIVER' && viewerId === driverId)) {
      return vehicleLocationsRepository.findLatestByDriverId(driverId);
    }

    if (role === 'STUDENT') {
      const isAssigned = await studentDriverAssignmentsRepository.isStudentAssignedToDriver(viewerId, driverId);

      if (isAssigned) {
        return vehicleLocationsRepository.findLatestByDriverId(driverId);
      }
    }

    throw new AppError('You do not have access to this vehicle location', 403);
  },

  async latestForAssignedDriver(studentUserId: string, role: string) {
    if (role !== 'STUDENT') {
      throw new AppError('Only students can view their assigned driver location', 403);
    }

    const driverId = await studentDriverAssignmentsRepository.findDriverIdForStudent(studentUserId);

    if (!driverId) {
      throw new AppError('No driver assigned to this student', 404);
    }

    return vehicleLocationsRepository.findLatestByDriverId(driverId);
  },
};
