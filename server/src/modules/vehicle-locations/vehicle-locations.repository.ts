import { pool } from '../../config/database.js';
import type { CreateVehicleLocationInput } from './vehicle-locations.schema.js';

export type VehicleLocation = {
  id: string;
  driverId: string;
  latitude: string;
  longitude: string;
  accuracy: string | null;
  heading: string | null;
  speed: string | null;
  recordedAt: Date;
  createdAt: Date;
};

type VehicleLocationRow = {
  id: string;
  driver_id: string;
  latitude: string;
  longitude: string;
  accuracy: string | null;
  heading: string | null;
  speed: string | null;
  recorded_at: Date;
  created_at: Date;
};

const mapVehicleLocation = (row: VehicleLocationRow): VehicleLocation => ({
  id: row.id,
  driverId: row.driver_id,
  latitude: row.latitude,
  longitude: row.longitude,
  accuracy: row.accuracy,
  heading: row.heading,
  speed: row.speed,
  recordedAt: row.recorded_at,
  createdAt: row.created_at,
});

export const vehicleLocationsRepository = {
  async create(driverId: string, input: CreateVehicleLocationInput): Promise<VehicleLocation> {
    const result = await pool.query<VehicleLocationRow>(
      `INSERT INTO vehicle_locations (
         driver_id, latitude, longitude, accuracy, heading, speed, recorded_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, now()))
       RETURNING id, driver_id, latitude, longitude, accuracy, heading, speed, recorded_at, created_at`,
      [
        driverId,
        input.latitude,
        input.longitude,
        input.accuracy ?? null,
        input.heading ?? null,
        input.speed ?? null,
        input.recordedAt ?? null,
      ],
    );

    return mapVehicleLocation(result.rows[0]);
  },

  async findLatestByDriverId(driverId: string): Promise<VehicleLocation | null> {
    const result = await pool.query<VehicleLocationRow>(
      `SELECT id, driver_id, latitude, longitude, accuracy, heading, speed, recorded_at, created_at
       FROM vehicle_locations
       WHERE driver_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [driverId],
    );

    return result.rows[0] ? mapVehicleLocation(result.rows[0]) : null;
  },
};
