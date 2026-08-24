import { AppError } from '../../utils/app-error.js';
import { usersRepository } from './users.repository.js';
import type { UpdateUserInput } from './users.schema.js';

export const usersService = {
  async getMe(userId: string) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async updateMe(userId: string, input: UpdateUserInput) {
    if (!input.mobileNumber) {
      return this.getMe(userId);
    }

    return usersRepository.updateMobileNumber(userId, input.mobileNumber);
  },
};
