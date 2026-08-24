import { pool } from '../../config/database.js';
import type { PublicUser, UserRecord } from './auth.types.js';

type UserRow = {
  id: string;
  mobile_number: string;
  password_hash: string;
  role: UserRecord['role'];
  profile_completed: boolean;
  is_active: boolean;
};

const mapUserRow = (row: UserRow): UserRecord => ({
  id: row.id,
  mobileNumber: row.mobile_number,
  passwordHash: row.password_hash,
  role: row.role,
  profileCompleted: row.profile_completed,
  isActive: row.is_active,
});

const toPublicUser = (user: UserRecord): PublicUser => {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
};

export const authRepository = {
  async createStudentUser(mobileNumber: string, passwordHash: string): Promise<PublicUser> {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (mobile_number, password_hash, role, profile_completed)
       VALUES ($1, $2, 'STUDENT', false)
       RETURNING id, mobile_number, password_hash, role, profile_completed, is_active`,
      [mobileNumber, passwordHash],
    );

    return toPublicUser(mapUserRow(result.rows[0]));
  },

  async findByMobileNumber(mobileNumber: string): Promise<UserRecord | null> {
    const result = await pool.query<UserRow>(
      `SELECT id, mobile_number, password_hash, role, profile_completed, is_active
       FROM users
       WHERE mobile_number = $1`,
      [mobileNumber],
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  },

  async findPublicUserById(id: string): Promise<PublicUser | null> {
    const result = await pool.query<UserRow>(
      `SELECT id, mobile_number, password_hash, role, profile_completed, is_active
       FROM users
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] ? toPublicUser(mapUserRow(result.rows[0])) : null;
  },
};
