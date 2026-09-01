import { describe, expect, it } from 'vitest';
import { parseStoredUser } from './authSession';

describe('parseStoredUser', () => {
  it('returns a valid persisted user', () => {
    expect(
      parseStoredUser(
        JSON.stringify({
          id: 'user-id',
          mobileNumber: '0501234567',
          role: 'STUDENT',
          profileCompleted: false,
        }),
      ),
    ).toEqual({
      id: 'user-id',
      mobileNumber: '0501234567',
      role: 'STUDENT',
      profileCompleted: false,
    });
  });

  it('rejects malformed and incomplete persisted values without throwing', () => {
    expect(parseStoredUser('{not-json')).toBeNull();
    expect(parseStoredUser(JSON.stringify({ id: 'user-id' }))).toBeNull();
  });
});
