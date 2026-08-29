CREATE TYPE student_trip_origin AS ENUM ('HOME', 'SCHOOL');

ALTER TABLE student_profiles
  ADD COLUMN trip_origin student_trip_origin NOT NULL DEFAULT 'HOME';
