import bcrypt from 'bcrypt';
import { environment } from '../src/config/environment.js';
import { pool } from '../src/config/database.js';

const INITIAL_DRIVER_MOBILE_NUMBER = '0522465535';

const seedInitialDriver = async () => {
  if (!environment.INITIAL_DRIVER_PASSWORD) {
    console.log('Skipping initial driver seed because INITIAL_DRIVER_PASSWORD is not set.');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingUserResult = await client.query<{ id: string; role: 'ADMIN' | 'DRIVER' | 'STUDENT' }>(
      `SELECT id, role
       FROM users
       WHERE mobile_number = $1
       FOR UPDATE`,
      [INITIAL_DRIVER_MOBILE_NUMBER],
    );

    const existingUser = existingUserResult.rows[0];
    if (existingUser && existingUser.role !== 'DRIVER') {
      throw new Error(
        `Cannot seed the initial driver because ${INITIAL_DRIVER_MOBILE_NUMBER} belongs to a ${existingUser.role} account.`,
      );
    }

    let driverUserId = existingUser?.id;
    if (!driverUserId) {
      const passwordHash = await bcrypt.hash(environment.INITIAL_DRIVER_PASSWORD, 12);
      const insertedUserResult = await client.query<{ id: string }>(
        `INSERT INTO users (mobile_number, password_hash, role, profile_completed)
         VALUES ($1, $2, 'DRIVER', true)
         RETURNING id`,
        [INITIAL_DRIVER_MOBILE_NUMBER, passwordHash],
      );
      driverUserId = insertedUserResult.rows[0].id;
    }

    await client.query(
      `INSERT INTO driver_profiles (user_id, full_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [driverUserId, environment.INITIAL_DRIVER_FULL_NAME],
    );

    await client.query(
      `INSERT INTO student_driver_assignments (student_user_id, driver_user_id)
       SELECT student_profile.user_id, $1
       FROM student_profiles AS student_profile
       ON CONFLICT (student_user_id) DO UPDATE
       SET driver_user_id = EXCLUDED.driver_user_id,
           assigned_at = now(),
           updated_at = now()`,
      [driverUserId],
    );

    await client.query('COMMIT');
    console.log(`Initial driver ${INITIAL_DRIVER_MOBILE_NUMBER} is ready.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedInitialDriver().catch((error) => {
  console.error(error);
  process.exit(1);
});
