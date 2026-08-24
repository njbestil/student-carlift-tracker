import { pool } from '../../config/database.js';
import type { UpsertDriverProfileInput } from './drivers.schema.js';

export type DriverProfile = {
  id: string;
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
};

type DriverProfileRow = {
  id: string;
  user_id: string;
  full_name: string;
  profile_photo_url: string | null;
};

const mapDriverProfile = (row: DriverProfileRow): DriverProfile => ({
  id: row.id,
  userId: row.user_id,
  fullName: row.full_name,
  profilePhotoUrl: row.profile_photo_url,
});

export const driversRepository = {
  async findByUserId(userId: string): Promise<DriverProfile | null> {
    const result = await pool.query<DriverProfileRow>(
      `SELECT id, user_id, full_name, profile_photo_url
       FROM driver_profiles
       WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0] ? mapDriverProfile(result.rows[0]) : null;
  },

  async upsert(userId: string, input: UpsertDriverProfileInput): Promise<DriverProfile> {
    const result = await pool.query<DriverProfileRow>(
      `INSERT INTO driver_profiles (user_id, full_name, profile_photo_url)
       VALUES ($1, $2, NULLIF($3, ''))
       ON CONFLICT (user_id) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           profile_photo_url = EXCLUDED.profile_photo_url,
           updated_at = now()
       RETURNING id, user_id, full_name, profile_photo_url`,
      [userId, input.fullName, input.profilePhotoUrl ?? ''],
    );

    return mapDriverProfile(result.rows[0]);
  },

  async markProfileCompleted(userId: string): Promise<void> {
    await pool.query('UPDATE users SET profile_completed = true, updated_at = now() WHERE id = $1', [userId]);
  },
};
