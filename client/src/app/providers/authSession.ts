import type { AuthenticatedUser } from '../../services/api/apiTypes';

export const parseStoredUser = (storedUser: string | null): AuthenticatedUser | null => {
  if (!storedUser) return null;

  try {
    const candidate: unknown = JSON.parse(storedUser);

    if (
      !candidate ||
      typeof candidate !== 'object' ||
      !('id' in candidate) ||
      !('mobileNumber' in candidate) ||
      !('role' in candidate) ||
      !('profileCompleted' in candidate) ||
      typeof candidate.id !== 'string' ||
      typeof candidate.mobileNumber !== 'string' ||
      !['ADMIN', 'DRIVER', 'STUDENT'].includes(String(candidate.role)) ||
      typeof candidate.profileCompleted !== 'boolean'
    ) {
      return null;
    }

    return candidate as AuthenticatedUser;
  } catch {
    return null;
  }
};
