import { pool } from '../../config/database.js';

type StudentDriverAssignmentRow = {
  driver_user_id: string;
};

export const studentDriverAssignmentsRepository = {
  async assignStudentToStaticDriver(studentUserId: string): Promise<void> {
    await pool.query(
      `INSERT INTO student_driver_assignments (student_user_id, driver_user_id)
       SELECT $1, driver_profile.user_id
       FROM driver_profiles AS driver_profile
       INNER JOIN users AS driver_user ON driver_user.id = driver_profile.user_id
       WHERE driver_user.role = 'DRIVER'
         AND driver_user.is_active = true
       ORDER BY driver_user.created_at ASC, driver_user.id ASC
       LIMIT 1
       ON CONFLICT (student_user_id) DO UPDATE
       SET driver_user_id = EXCLUDED.driver_user_id,
           assigned_at = now(),
           updated_at = now()`,
      [studentUserId],
    );
  },

  async assignAllStudentsToStaticDriver(): Promise<void> {
    await pool.query(
      `INSERT INTO student_driver_assignments (student_user_id, driver_user_id)
       SELECT student_profile.user_id, static_driver.user_id
       FROM student_profiles AS student_profile
       CROSS JOIN LATERAL (
         SELECT driver_profile.user_id
         FROM driver_profiles AS driver_profile
         INNER JOIN users AS driver_user ON driver_user.id = driver_profile.user_id
         WHERE driver_user.role = 'DRIVER'
           AND driver_user.is_active = true
         ORDER BY driver_user.created_at ASC, driver_user.id ASC
         LIMIT 1
       ) AS static_driver
       ON CONFLICT (student_user_id) DO UPDATE
       SET driver_user_id = EXCLUDED.driver_user_id,
           assigned_at = now(),
           updated_at = now()`,
    );
  },

  async findDriverIdForStudent(studentUserId: string): Promise<string | null> {
    const result = await pool.query<StudentDriverAssignmentRow>(
      `SELECT driver_user_id
       FROM student_driver_assignments
       WHERE student_user_id = $1`,
      [studentUserId],
    );

    return result.rows[0]?.driver_user_id ?? null;
  },

  async isStudentAssignedToDriver(studentUserId: string, driverUserId: string): Promise<boolean> {
    const result = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM student_driver_assignments
         WHERE student_user_id = $1
           AND driver_user_id = $2
       )`,
      [studentUserId, driverUserId],
    );

    return result.rows[0]?.exists ?? false;
  },
};
