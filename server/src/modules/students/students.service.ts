import { AppError } from '../../utils/app-error.js';
import { studentsRepository } from './students.repository.js';
import type { UpsertStudentProfileInput } from './students.schema.js';

export const studentsService = {
  async getMe(userId: string) {
    return studentsRepository.findByUserId(userId);
  },

  async upsertMe(userId: string, role: string, input: UpsertStudentProfileInput) {
    if (role !== 'STUDENT') {
      throw new AppError('Only student accounts can update student profiles', 403);
    }

    const profile = await studentsRepository.upsert(userId, input);
    await studentsRepository.markProfileCompleted(userId);
    return profile;
  },
};
