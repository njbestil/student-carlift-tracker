ALTER TYPE driver_trip_run_status ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE driver_trip_runs
  DROP CONSTRAINT driver_trip_runs_completion_matches_status,
  ADD CONSTRAINT driver_trip_runs_completion_matches_status CHECK (
    (status = 'IN_PROGRESS' AND completed_at IS NULL)
    OR (status <> 'IN_PROGRESS' AND completed_at IS NOT NULL)
  );
