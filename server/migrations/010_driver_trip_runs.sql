CREATE TYPE driver_trip_run_status AS ENUM ('IN_PROGRESS', 'COMPLETED');

CREATE TABLE driver_trip_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_user_id UUID NOT NULL REFERENCES driver_profiles(user_id) ON DELETE CASCADE,
  trip_origin student_trip_origin NOT NULL,
  status driver_trip_run_status NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT driver_trip_runs_completion_matches_status CHECK (
    (status = 'IN_PROGRESS' AND completed_at IS NULL)
    OR (status = 'COMPLETED' AND completed_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX idx_driver_trip_runs_one_active_per_driver
  ON driver_trip_runs(driver_user_id)
  WHERE status = 'IN_PROGRESS';

CREATE TABLE driver_trip_run_students (
  trip_run_id UUID NOT NULL REFERENCES driver_trip_runs(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  service_status student_service_status NOT NULL DEFAULT 'WAITING',
  picked_up_at TIMESTAMPTZ,
  dropped_off_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (trip_run_id, student_user_id)
);

CREATE INDEX idx_driver_trip_run_students_student
  ON driver_trip_run_students(student_user_id);
