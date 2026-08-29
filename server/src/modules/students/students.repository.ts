import { pool } from '../../config/database.js';
import type { StudentServiceStatus, StudentTripOrigin } from '../../constants/roles.js';
import type { UpsertStudentProfileInput } from './students.schema.js';

export type StudentProfile = {
  id: string;
  userId: string;
  studentFullName: string;
  parentFullName: string;
  completeAddress: string;
  emergencyNumber: string;
  profilePhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  serviceStatus: StudentServiceStatus;
  pickedUpAt: string | null;
  droppedOffAt: string | null;
  tripOrigin: StudentTripOrigin;
};

export type AssignedDriverDetails = {
  name: string;
  address: string | null;
  contactNumber: string;
  vehicleType: string | null;
  vehiclePlateNumber: string | null;
};

type AssignedDriverDetailsRow = {
  full_name: string;
  address: string | null;
  mobile_number: string;
  vehicle_type: string | null;
  vehicle_plate_number: string | null;
};

type StudentProfileRow = {
  id: string;
  user_id: string;
  student_full_name: string;
  parent_full_name: string;
  complete_address: string;
  emergency_number: string;
  profile_photo_url: string | null;
  latitude: string | null;
  longitude: string | null;
  service_status: StudentServiceStatus;
  picked_up_at: string | null;
  dropped_off_at: string | null;
  trip_origin: StudentTripOrigin;
};

const mapStudentProfile = (row: StudentProfileRow): StudentProfile => ({
  id: row.id,
  userId: row.user_id,
  studentFullName: row.student_full_name,
  parentFullName: row.parent_full_name,
  completeAddress: row.complete_address,
  emergencyNumber: row.emergency_number,
  profilePhotoUrl: row.profile_photo_url,
  latitude: row.latitude === null ? null : Number(row.latitude),
  longitude: row.longitude === null ? null : Number(row.longitude),
  serviceStatus: row.service_status,
  pickedUpAt: row.picked_up_at,
  droppedOffAt: row.dropped_off_at,
  tripOrigin: row.trip_origin,
});

const mapAssignedDriverDetails = (row: AssignedDriverDetailsRow): AssignedDriverDetails => ({
  name: row.full_name,
  address: row.address,
  contactNumber: row.mobile_number,
  vehicleType: row.vehicle_type,
  vehiclePlateNumber: row.vehicle_plate_number,
});

const studentProfileFields = `id, user_id, student_full_name, parent_full_name, complete_address,
                              emergency_number, profile_photo_url, latitude, longitude, service_status, picked_up_at, dropped_off_at,
                              trip_origin`;

export const studentsRepository = {
  async findAssignedDriverDetails(studentUserId: string): Promise<AssignedDriverDetails | null> {
    const result = await pool.query<AssignedDriverDetailsRow>(
      `SELECT driver_profile.full_name,
              driver_profile.address,
              driver_user.mobile_number,
              driver_profile.vehicle_type,
              driver_profile.vehicle_plate_number
       FROM student_driver_assignments AS assignment
       INNER JOIN driver_profiles AS driver_profile ON driver_profile.user_id = assignment.driver_user_id
       INNER JOIN users AS driver_user ON driver_user.id = assignment.driver_user_id
       WHERE assignment.student_user_id = $1
         AND driver_user.role = 'DRIVER'
         AND driver_user.is_active = true`,
      [studentUserId],
    );

    return result.rows[0] ? mapAssignedDriverDetails(result.rows[0]) : null;
  },

  async findByUserId(userId: string): Promise<StudentProfile | null> {
    const result = await pool.query<StudentProfileRow>(
      `SELECT ${studentProfileFields}
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
         profile_photo_url,
         latitude,
         longitude
       )
       VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''), $7, $8)
       ON CONFLICT (user_id) DO UPDATE
       SET student_full_name = EXCLUDED.student_full_name,
           parent_full_name = EXCLUDED.parent_full_name,
           complete_address = EXCLUDED.complete_address,
           emergency_number = EXCLUDED.emergency_number,
           profile_photo_url = EXCLUDED.profile_photo_url,
           latitude = CASE WHEN $7::numeric IS NULL THEN student_profiles.latitude ELSE EXCLUDED.latitude END,
           longitude = CASE WHEN $8::numeric IS NULL THEN student_profiles.longitude ELSE EXCLUDED.longitude END,
           updated_at = now()
       RETURNING ${studentProfileFields}`,
      [
        userId,
        input.studentFullName,
        input.parentFullName,
        input.completeAddress,
        input.emergencyNumber,
        input.profilePhotoUrl ?? '',
        input.latitude ?? null,
        input.longitude ?? null,
      ],
    );

    return mapStudentProfile(result.rows[0]);
  },

  async markProfileCompleted(userId: string): Promise<void> {
    await pool.query('UPDATE users SET profile_completed = true, updated_at = now() WHERE id = $1', [userId]);
  },

};
