CREATE TABLE vehicle_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  accuracy NUMERIC(8, 2),
  heading NUMERIC(6, 2),
  speed NUMERIC(8, 2),
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_locations_driver_recorded_at
  ON vehicle_locations(driver_id, recorded_at DESC);
