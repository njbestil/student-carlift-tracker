import { pool } from '../../config/database.js';
import type {
  StartDriverTripInput,
  UpdateDriverServiceStatusInput,
  UpdateTripStudentStatusInput,
  UpsertDriverProfileInput,
} from './drivers.schema.js';

export type DriverProfile = {
  id: string;
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  address: string | null;
  vehicleType: string | null;
  vehiclePlateNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  isOnService: boolean;
};

export type AssignedStudent = {
  userId: string;
  studentFullName: string;
  parentFullName: string;
  contactNumber: string;
  emergencyNumber: string;
  completeAddress: string;
  profilePhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  serviceStatus: 'ABSENT' | 'WAITING' | 'PICKED_UP' | 'DROPPED_OFF';
};

export type DriverTrip = {
  id: string;
  tripOrigin: 'HOME' | 'SCHOOL';
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
  completedAt: string | null;
};

type TripStatusTransitionResult =
  | { kind: 'updated'; student: AssignedStudent; trip: DriverTrip }
  | { kind: 'no_active_trip' }
  | { kind: 'student_not_in_trip' }
  | { kind: 'invalid_transition'; currentStatus: AssignedStudent['serviceStatus'] };

type DriverProfileRow = {
  id: string;
  user_id: string;
  full_name: string;
  profile_photo_url: string | null;
  address: string | null;
  vehicle_type: string | null;
  vehicle_plate_number: string | null;
  latitude: string | null;
  longitude: string | null;
  is_on_service: boolean;
};

type AssignedStudentRow = {
  user_id: string;
  student_full_name: string;
  parent_full_name: string;
  mobile_number: string;
  emergency_number: string;
  complete_address: string;
  profile_photo_url: string | null;
  latitude: string | null;
  longitude: string | null;
  service_status: AssignedStudent['serviceStatus'];
};

type DriverTripRow = {
  id: string;
  trip_origin: DriverTrip['tripOrigin'];
  status: DriverTrip['status'];
  started_at: string;
  completed_at: string | null;
};

const mapDriverProfile = (row: DriverProfileRow): DriverProfile => ({
  id: row.id,
  userId: row.user_id,
  fullName: row.full_name,
  profilePhotoUrl: row.profile_photo_url,
  address: row.address,
  vehicleType: row.vehicle_type,
  vehiclePlateNumber: row.vehicle_plate_number,
  latitude: row.latitude === null ? null : Number(row.latitude),
  longitude: row.longitude === null ? null : Number(row.longitude),
  isOnService: row.is_on_service,
});

const mapAssignedStudent = (row: AssignedStudentRow): AssignedStudent => ({
  userId: row.user_id,
  studentFullName: row.student_full_name,
  parentFullName: row.parent_full_name,
  contactNumber: row.mobile_number,
  emergencyNumber: row.emergency_number,
  completeAddress: row.complete_address,
  profilePhotoUrl: row.profile_photo_url,
  latitude: row.latitude === null ? null : Number(row.latitude),
  longitude: row.longitude === null ? null : Number(row.longitude),
  serviceStatus: row.service_status,
});

const mapDriverTrip = (row: DriverTripRow): DriverTrip => ({
  id: row.id,
  tripOrigin: row.trip_origin,
  status: row.status,
  startedAt: row.started_at,
  completedAt: row.completed_at,
});

export const driversRepository = {
  async findByUserId(userId: string): Promise<DriverProfile | null> {
    const result = await pool.query<DriverProfileRow>(
      `SELECT id, user_id, full_name, profile_photo_url, address, vehicle_type, vehicle_plate_number, latitude, longitude, is_on_service
       FROM driver_profiles
       WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0] ? mapDriverProfile(result.rows[0]) : null;
  },

  async findAssignedStudents(driverUserId: string): Promise<AssignedStudent[]> {
    const result = await pool.query<AssignedStudentRow>(
      `SELECT student_profile.user_id,
              student_profile.student_full_name,
              student_profile.parent_full_name,
              student_user.mobile_number,
              student_profile.emergency_number,
              student_profile.complete_address,
              student_profile.profile_photo_url,
              student_profile.latitude,
              student_profile.longitude,
              student_profile.service_status
       FROM student_driver_assignments AS assignment
       INNER JOIN student_profiles AS student_profile ON student_profile.user_id = assignment.student_user_id
       INNER JOIN users AS student_user ON student_user.id = assignment.student_user_id
       WHERE assignment.driver_user_id = $1
         AND student_user.role = 'STUDENT'
         AND student_user.is_active = true
       ORDER BY student_profile.student_full_name ASC`,
      [driverUserId],
    );

    return result.rows.map(mapAssignedStudent);
  },

  async findActiveTrip(driverUserId: string): Promise<DriverTrip | null> {
    const result = await pool.query<DriverTripRow>(
      `SELECT id, trip_origin, status, started_at, completed_at
       FROM driver_trip_runs
       WHERE driver_user_id = $1
         AND status = 'IN_PROGRESS'`,
      [driverUserId],
    );

    return result.rows[0] ? mapDriverTrip(result.rows[0]) : null;
  },

  async findTripStudents(tripRunId: string, driverUserId: string): Promise<AssignedStudent[]> {
    const result = await pool.query<AssignedStudentRow>(
      `SELECT student_profile.user_id,
              student_profile.student_full_name,
              student_profile.parent_full_name,
              student_user.mobile_number,
              student_profile.emergency_number,
              student_profile.complete_address,
              student_profile.profile_photo_url,
              student_profile.latitude,
              student_profile.longitude,
              trip_student.service_status
       FROM driver_trip_run_students AS trip_student
       INNER JOIN driver_trip_runs AS trip_run ON trip_run.id = trip_student.trip_run_id
       INNER JOIN student_profiles AS student_profile ON student_profile.user_id = trip_student.student_user_id
       INNER JOIN users AS student_user ON student_user.id = trip_student.student_user_id
       WHERE trip_student.trip_run_id = $1
         AND trip_run.driver_user_id = $2
       ORDER BY student_profile.student_full_name ASC`,
      [tripRunId, driverUserId],
    );

    return result.rows.map(mapAssignedStudent);
  },

  async startTrip(driverUserId: string, input: StartDriverTripInput): Promise<DriverTrip> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const tripResult = await client.query<DriverTripRow>(
        `INSERT INTO driver_trip_runs (driver_user_id, trip_origin)
         VALUES ($1, $2::student_trip_origin)
         RETURNING id, trip_origin, status, started_at, completed_at`,
        [driverUserId, input.tripOrigin],
      );
      const trip = mapDriverTrip(tripResult.rows[0]);

      await client.query(
        `INSERT INTO driver_trip_run_students (trip_run_id, student_user_id, service_status)
         SELECT $1,
                assignment.student_user_id,
                CASE
                  WHEN student_profile.service_status = 'ABSENT' THEN 'ABSENT'::student_service_status
                  ELSE 'WAITING'::student_service_status
                END
         FROM student_driver_assignments AS assignment
         INNER JOIN student_profiles AS student_profile ON student_profile.user_id = assignment.student_user_id
         INNER JOIN users AS student_user ON student_user.id = assignment.student_user_id
         WHERE assignment.driver_user_id = $2
           AND student_user.role = 'STUDENT'
           AND student_user.is_active = true`,
        [trip.id, driverUserId],
      );

      await client.query(
        `UPDATE student_profiles AS student_profile
         SET service_status = trip_student.service_status,
             trip_origin = $2::student_trip_origin,
             picked_up_at = NULL,
             dropped_off_at = NULL,
             updated_at = now()
         FROM driver_trip_run_students AS trip_student
         WHERE trip_student.trip_run_id = $1
           AND student_profile.user_id = trip_student.student_user_id`,
        [trip.id, input.tripOrigin],
      );

      const completedResult = await client.query<DriverTripRow>(
        `UPDATE driver_trip_runs
         SET status = 'COMPLETED', completed_at = now(), updated_at = now()
         WHERE id = $1
           AND EXISTS (
             SELECT 1
             FROM driver_trip_run_students
             WHERE trip_run_id = $1
               AND service_status = 'DROPPED_OFF'
           )
           AND NOT EXISTS (
             SELECT 1
             FROM driver_trip_run_students
             WHERE trip_run_id = $1
               AND service_status NOT IN ('ABSENT', 'DROPPED_OFF')
           )
         RETURNING id, trip_origin, status, started_at, completed_at`,
        [trip.id],
      );

      await client.query('COMMIT');
      return completedResult.rows[0] ? mapDriverTrip(completedResult.rows[0]) : trip;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async transitionTripStudentStatus(
    driverUserId: string,
    studentUserId: string,
    input: UpdateTripStudentStatusInput,
  ): Promise<TripStatusTransitionResult> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const tripResult = await client.query<DriverTripRow>(
        `SELECT id, trip_origin, status, started_at, completed_at
         FROM driver_trip_runs
         WHERE driver_user_id = $1
           AND status = 'IN_PROGRESS'
         FOR UPDATE`,
        [driverUserId],
      );
      const tripRow = tripResult.rows[0];

      if (!tripRow) {
        await client.query('ROLLBACK');
        return { kind: 'no_active_trip' };
      }

      const statusResult = await client.query<{ service_status: AssignedStudent['serviceStatus'] }>(
        `SELECT service_status
         FROM driver_trip_run_students
         WHERE trip_run_id = $1
           AND student_user_id = $2
         FOR UPDATE`,
        [tripRow.id, studentUserId],
      );
      const currentStatus = statusResult.rows[0]?.service_status;

      if (!currentStatus) {
        await client.query('ROLLBACK');
        return { kind: 'student_not_in_trip' };
      }

      const isAllowed = (currentStatus === 'WAITING' && ['PICKED_UP', 'ABSENT'].includes(input.serviceStatus))
        || (currentStatus === 'PICKED_UP' && input.serviceStatus === 'DROPPED_OFF')
        || (currentStatus === 'ABSENT' && input.serviceStatus === 'WAITING');

      if (!isAllowed) {
        await client.query('ROLLBACK');
        return { kind: 'invalid_transition', currentStatus };
      }

      await client.query(
        `UPDATE driver_trip_run_students
         SET service_status = $3::student_service_status,
             picked_up_at = CASE
               WHEN $3::student_service_status = 'PICKED_UP' THEN now()
               WHEN $3::student_service_status IN ('ABSENT', 'WAITING') THEN NULL
               ELSE picked_up_at
             END,
             dropped_off_at = CASE
               WHEN $3::student_service_status = 'DROPPED_OFF' THEN now()
               WHEN $3::student_service_status IN ('ABSENT', 'WAITING', 'PICKED_UP') THEN NULL
               ELSE dropped_off_at
             END,
             updated_at = now()
         WHERE trip_run_id = $1
           AND student_user_id = $2`,
        [tripRow.id, studentUserId, input.serviceStatus],
      );

      await client.query(
        `UPDATE student_profiles
         SET service_status = $2::student_service_status,
             trip_origin = $3::student_trip_origin,
             picked_up_at = CASE
               WHEN $2::student_service_status = 'PICKED_UP' THEN now()
               WHEN $2::student_service_status IN ('ABSENT', 'WAITING') THEN NULL
               ELSE picked_up_at
             END,
             dropped_off_at = CASE
               WHEN $2::student_service_status = 'DROPPED_OFF' THEN now()
               WHEN $2::student_service_status IN ('ABSENT', 'WAITING', 'PICKED_UP') THEN NULL
               ELSE dropped_off_at
             END,
             updated_at = now()
         WHERE user_id = $1`,
        [studentUserId, input.serviceStatus, tripRow.trip_origin],
      );

      const completedResult = await client.query<DriverTripRow>(
        `UPDATE driver_trip_runs
         SET status = 'COMPLETED', completed_at = now(), updated_at = now()
         WHERE id = $1
           AND EXISTS (
             SELECT 1
             FROM driver_trip_run_students
             WHERE trip_run_id = $1
               AND service_status = 'DROPPED_OFF'
           )
           AND NOT EXISTS (
             SELECT 1
             FROM driver_trip_run_students
             WHERE trip_run_id = $1
               AND service_status NOT IN ('ABSENT', 'DROPPED_OFF')
           )
         RETURNING id, trip_origin, status, started_at, completed_at`,
        [tripRow.id],
      );

      await client.query('COMMIT');
      const students = await this.findTripStudents(tripRow.id, driverUserId);
      const student = students.find((candidate) => candidate.userId === studentUserId);

      return { kind: 'updated', student: student!, trip: completedResult.rows[0] ? mapDriverTrip(completedResult.rows[0]) : mapDriverTrip(tripRow) };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async upsert(userId: string, input: UpsertDriverProfileInput): Promise<DriverProfile> {
    const result = await pool.query<DriverProfileRow>(
      `INSERT INTO driver_profiles (
         user_id, full_name, profile_photo_url, address, vehicle_type, vehicle_plate_number, latitude, longitude
       )
       VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), NULLIF($5, ''), NULLIF($6, ''), $7, $8)
       ON CONFLICT (user_id) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           profile_photo_url = EXCLUDED.profile_photo_url,
           address = CASE
             WHEN $4::text IS NULL THEN driver_profiles.address
             ELSE NULLIF($4, '')
           END,
           vehicle_type = CASE
             WHEN $5::text IS NULL THEN driver_profiles.vehicle_type
             ELSE NULLIF($5, '')
           END,
           vehicle_plate_number = CASE
             WHEN $6::text IS NULL THEN driver_profiles.vehicle_plate_number
             ELSE NULLIF($6, '')
           END,
           latitude = CASE WHEN $7::numeric IS NULL THEN driver_profiles.latitude ELSE EXCLUDED.latitude END,
           longitude = CASE WHEN $8::numeric IS NULL THEN driver_profiles.longitude ELSE EXCLUDED.longitude END,
           updated_at = now()
       RETURNING id, user_id, full_name, profile_photo_url, address, vehicle_type, vehicle_plate_number, latitude, longitude, is_on_service`,
      [
        userId,
        input.fullName,
        input.profilePhotoUrl ?? '',
        input.address,
        input.vehicleType,
        input.vehiclePlateNumber,
        input.latitude ?? null,
        input.longitude ?? null,
      ],
    );

    return mapDriverProfile(result.rows[0]);
  },

  async markProfileCompleted(userId: string): Promise<void> {
    await pool.query('UPDATE users SET profile_completed = true, updated_at = now() WHERE id = $1', [userId]);
  },

  async updateServiceStatus(
    userId: string,
    input: UpdateDriverServiceStatusInput,
  ): Promise<DriverProfile | null> {
    const result = await pool.query<DriverProfileRow>(
      `UPDATE driver_profiles
       SET is_on_service = $2,
           updated_at = now()
       WHERE user_id = $1
       RETURNING id, user_id, full_name, profile_photo_url, address, vehicle_type, vehicle_plate_number, latitude, longitude, is_on_service`,
      [userId, input.isOnService],
    );

    return result.rows[0] ? mapDriverProfile(result.rows[0]) : null;
  },
};
