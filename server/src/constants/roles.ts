export const USER_ROLES = ['ADMIN', 'DRIVER', 'STUDENT'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const STUDENT_SERVICE_STATUSES = [
  'ABSENT',
  'WAITING',
  'PICKED_UP',
  'DROPPED_OFF',
] as const;

export type StudentServiceStatus = (typeof STUDENT_SERVICE_STATUSES)[number];

export const STUDENT_TRIP_ORIGINS = ['HOME', 'SCHOOL'] as const;

export type StudentTripOrigin = (typeof STUDENT_TRIP_ORIGINS)[number];
