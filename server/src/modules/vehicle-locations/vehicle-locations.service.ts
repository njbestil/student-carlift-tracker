import { AppError } from '../../utils/app-error.js';
import { vehicleLocationsRepository } from './vehicle-locations.repository.js';
import type { CreateVehicleLocationInput } from './vehicle-locations.schema.js';

export const vehicleLocationsService = {
  async create(driverId: string, role: string, input: CreateVehicleLocationInput) {
    if (role !== 'DRIVER') {
      throw new AppError('Only drivers can submit vehicle locations', 403);
    }

    return vehicleLocationsRepository.create(driverId, input);
  },

  async latest(driverId: string) {
    return vehicleLocationsRepository.findLatestByDriverId(driverId);
  },
};
