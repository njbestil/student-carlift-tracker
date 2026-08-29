ALTER TABLE driver_profiles
  ADD COLUMN address TEXT,
  ADD COLUMN vehicle_type VARCHAR(120),
  ADD COLUMN vehicle_plate_number VARCHAR(32);
