import { createContext } from 'react';
import type { AuthenticatedUser } from '../../services/api/apiTypes';

export type AuthContextValue = {
  user: AuthenticatedUser | null;
  token: string | null;
  setSession: (user: AuthenticatedUser, token: string) => void;
  updateUser: (user: AuthenticatedUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
