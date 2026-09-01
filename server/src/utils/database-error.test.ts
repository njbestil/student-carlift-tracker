import { describe, expect, it } from 'vitest';
import { isUniqueViolation } from './database-error.js';

describe('isUniqueViolation', () => {
  it('recognizes PostgreSQL unique constraint errors', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
  });

  it('does not classify unrelated errors as duplicate conflicts', () => {
    expect(isUniqueViolation({ code: '23503' })).toBe(false);
    expect(isUniqueViolation(new Error('network failure'))).toBe(false);
  });
});
