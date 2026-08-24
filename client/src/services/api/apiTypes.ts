export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
};

export type UserRole = 'ADMIN' | 'DRIVER' | 'STUDENT';

export type AuthenticatedUser = {
  id: string;
  mobileNumber: string;
  role: UserRole;
  profileCompleted: boolean;
};

export type AuthResponse = {
  user: AuthenticatedUser;
  token: string;
};
