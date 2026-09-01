import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { AuthenticatedUser } from '../../services/api/apiTypes';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';
import { parseStoredUser } from './authSession';

const userStorageKey = 'student-carlift-user';
const tokenStorageKey = 'student-carlift-token';

const readStoredUser = () => {
  const storedUser = localStorage.getItem(userStorageKey);
  const user = parseStoredUser(storedUser);

  if (!user && storedUser) {
    localStorage.removeItem(userStorageKey);
    localStorage.removeItem(tokenStorageKey);
  }

  return user;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenStorageKey));

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      setSession: (nextUser, nextToken) => {
        localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
        localStorage.setItem(tokenStorageKey, nextToken);
        setUser(nextUser);
        setToken(nextToken);
      },
      updateUser: (nextUser) => {
        localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem(userStorageKey);
        localStorage.removeItem(tokenStorageKey);
        setUser(null);
        setToken(null);
      },
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
