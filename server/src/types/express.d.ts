import type { UserRole } from '../constants/roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        mobileNumber: string;
        role: UserRole;
        profileCompleted: boolean;
      };
    }
  }
}
