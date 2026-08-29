ALTER TABLE student_profiles
  ADD COLUMN picked_up_at TIMESTAMPTZ,
  ADD COLUMN dropped_off_at TIMESTAMPTZ;
