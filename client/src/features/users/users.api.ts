import { apiClient } from '../../services/api/apiClient';
import type { AuthenticatedUser } from '../../services/api/apiTypes';

export const usersApi = {
  updateMe: (mobileNumber: string, token: string) =>
    apiClient<{ user: AuthenticatedUser }>('/users/me', {
      method: 'PATCH',
      body: { mobileNumber },
      token,
    }),
};
