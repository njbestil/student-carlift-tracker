CREATE TABLE student_driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL UNIQUE REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  driver_user_id UUID NOT NULL REFERENCES driver_profiles(user_id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT student_driver_assignments_distinct_users
    CHECK (student_user_id <> driver_user_id)
);

CREATE INDEX idx_student_driver_assignments_driver_user_id
  ON student_driver_assignments(driver_user_id);
