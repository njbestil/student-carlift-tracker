import type { UserRole } from '../../constants/roles.js';

export type PublicUser = {
  id: string;
  mobileNumber: string;
  role: UserRole;
  profileCompleted: boolean;
  isActive: boolean;
};

export type UserRecord = PublicUser & {
  passwordHash: string;
};
