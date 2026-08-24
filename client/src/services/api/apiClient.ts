import { ApiError } from './apiError';
import type { ApiRequestOptions } from './apiTypes';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = async <TResponse>(
  path: string,
  { method = 'GET', body, token }: ApiRequestOptions = {},
): Promise<TResponse> => {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const error =
      data && typeof data === 'object' && 'error' in data
        ? (data.error as { message?: string; details?: unknown })
        : undefined;
    throw new ApiError(error?.message ?? 'API request failed', response.status, error?.details);
  }

  return data as TResponse;
};
