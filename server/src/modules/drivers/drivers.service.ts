import { AppError } from '../../utils/app-error.js';
import { driversRepository } from './drivers.repository.js';
import type { UpsertDriverProfileInput } from './drivers.schema.js';

export const driversService = {
  async getMe(userId: string) {
    return driversRepository.findByUserId(userId);
  },

  async upsertMe(userId: string, role: string, input: UpsertDriverProfileInput) {
    if (role !== 'DRIVER') {
      throw new AppError('Only driver accounts can update driver profiles', 403);
    }

    const profile = await driversRepository.upsert(userId, input);
    await driversRepository.markProfileCompleted(userId);
    return profile;
  },
};
