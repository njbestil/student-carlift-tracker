DO $$
DECLARE
  static_driver_id UUID;
  number_owner_id UUID;
BEGIN
  SELECT id
  INTO static_driver_id
  FROM users
  WHERE role = 'DRIVER'
    AND is_active = true
  ORDER BY created_at ASC, id ASC
  LIMIT 1;

  IF static_driver_id IS NULL THEN
    RAISE NOTICE 'No active driver exists yet; static driver assignments will be created when a driver profile is saved.';
    RETURN;
  END IF;

  SELECT id
  INTO number_owner_id
  FROM users
  WHERE mobile_number = '0522465535';

  IF number_owner_id IS NOT NULL AND number_owner_id <> static_driver_id THEN
    RAISE EXCEPTION 'Cannot assign mobile number 0522465535 because it belongs to another user';
  END IF;

  UPDATE users
  SET mobile_number = '0522465535',
      updated_at = now()
  WHERE id = static_driver_id;

  IF EXISTS (SELECT 1 FROM driver_profiles WHERE user_id = static_driver_id) THEN
    INSERT INTO student_driver_assignments (student_user_id, driver_user_id)
    SELECT student_profiles.user_id, static_driver_id
    FROM student_profiles
    ON CONFLICT (student_user_id) DO UPDATE
    SET driver_user_id = EXCLUDED.driver_user_id,
        assigned_at = now(),
        updated_at = now();
  ELSE
    RAISE NOTICE 'The static driver does not have a driver profile yet; assignments will be created when that profile is saved.';
  END IF;
END $$;
