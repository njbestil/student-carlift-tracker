type DatabaseError = {
  code?: unknown;
};

export const isUniqueViolation = (error: unknown): error is DatabaseError & { code: '23505' } =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
