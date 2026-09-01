import { describe, expect, it } from 'vitest';
import { registerSchema } from './auth.schema.js';

describe('registerSchema', () => {
  it('accepts a valid student registration payload', () => {
    expect(
      registerSchema.safeParse({
        mobileNumber: '0501234567',
        password: 'secure-password',
        confirmPassword: 'secure-password',
      }).success,
    ).toBe(true);
  });

  it('rejects mismatched passwords and malformed UAE mobile numbers', () => {
    expect(
      registerSchema.safeParse({
        mobileNumber: 'not-a-mobile-number',
        password: 'secure-password',
        confirmPassword: 'different-password',
      }).success,
    ).toBe(false);
  });
});
