import { pool } from '../../config/database.js';
import type { StudentServiceStatus } from '../../constants/roles.js';
import type { UpsertStudentProfileInput } from './students.schema.js';

export type StudentProfile = {
  id: string;
  userId: string;
  studentFullName: string;
  parentFullName: string;
  completeAddress: string;
  emergencyNumber: string;
  profilePhotoUrl: string | null;
  serviceStatus: StudentServiceStatus;
};

type StudentProfileRow = {
  id: string;
  user_id: string;
  student_full_name: string;
  parent_full_name: string;
  complete_address: string;
  emergency_number: string;
  profile_photo_url: string | null;
  service_status: StudentServiceStatus;
};

const mapStudentProfile = (row: StudentProfileRow): StudentProfile => ({
  id: row.id,
  userId: row.user_id,
  studentFullName: row.student_full_name,
  parentFullName: row.parent_full_name,
  completeAddress: row.complete_address,
  emergencyNumber: row.emergency_number,
  profilePhotoUrl: row.profile_photo_url,
  serviceStatus: row.service_status,
});

export const studentsRepository = {
  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const result = await pool.query<StudentProfileRow>(
      `SELECT id, user_id, student_full_name, parent_full_name, complete_address,
              emergency_number, profile_photo_url, service_status
       FROM student_profiles
       WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0] ? mapStudentProfile(result.rows[0]) : null;
  },

  async upsert(userId: string, input: UpsertStudentProfileInput): Promise<StudentProfile> {
    const result = await pool.query<StudentProfileRow>(
      `INSERT INTO student_profiles (
         user_id,
         student_full_name,
         parent_full_name,
         complete_address,
         emergency_number,
         profile_photo_url
       )
       VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''))
       ON CONFLICT (user_id) DO UPDATE
       SET student_full_name = EXCLUDED.student_full_name,
           parent_full_name = EXCLUDED.parent_full_name,
           complete_address = EXCLUDED.complete_address,
           emergency_number = EXCLUDED.emergency_number,
           profile_photo_url = EXCLUDED.profile_photo_url,
           updated_at = now()
       RETURNING id, user_id, student_full_name, parent_full_name, complete_address,
                 emergency_number, profile_photo_url, service_status`,
      [
        userId,
        input.studentFullName,
        input.parentFullName,
        input.completeAddress,
        input.emergencyNumber,
        input.profilePhotoUrl ?? '',
      ],
    );

    return mapStudentProfile(result.rows[0]);
  },

  async markProfileCompleted(userId: string): Promise<void> {
    await pool.query('UPDATE users SET profile_completed = true, updated_at = now() WHERE id = $1', [userId]);
  },
};
