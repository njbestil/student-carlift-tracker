import { pool } from '../../config/database.js';
import type { PublicUser } from '../auth/auth.types.js';

type UserRow = {
  id: string;
  mobile_number: string;
  role: PublicUser['role'];
  profile_completed: boolean;
  is_active: boolean;
};

const mapPublicUser = (row: UserRow): PublicUser => ({
  id: row.id,
  mobileNumber: row.mobile_number,
  role: row.role,
  profileCompleted: row.profile_completed,
  isActive: row.is_active,
});

export const usersRepository = {
  async findById(id: string): Promise<PublicUser | null> {
    const result = await pool.query<UserRow>(
      `SELECT id, mobile_number, role, profile_completed, is_active
       FROM users
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] ? mapPublicUser(result.rows[0]) : null;
  },

  async updateMobileNumber(userId: string, mobileNumber: string): Promise<PublicUser> {
    const result = await pool.query<UserRow>(
      `UPDATE users
       SET mobile_number = $2, updated_at = now()
       WHERE id = $1
       RETURNING id, mobile_number, role, profile_completed, is_active`,
      [userId, mobileNumber],
    );

    return mapPublicUser(result.rows[0]);
  },
};
