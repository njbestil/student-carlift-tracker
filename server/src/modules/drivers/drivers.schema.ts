import { z } from 'zod';
import { STUDENT_TRIP_ORIGINS } from '../../constants/roles.js';

export const upsertDriverProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
  address: z.string().trim().min(1).max(500).optional(),
  vehicleType: z.string().trim().min(1).max(120).optional(),
  vehiclePlateNumber: z.string().trim().min(1).max(32).optional(),
});

export const updateDriverServiceStatusSchema = z.object({
  isOnService: z.boolean(),
});

export const startDriverTripSchema = z.object({
  tripOrigin: z.enum(STUDENT_TRIP_ORIGINS),
});

export const updateTripStudentStatusSchema = z.object({
  serviceStatus: z.enum(['ABSENT', 'WAITING', 'PICKED_UP', 'DROPPED_OFF']),
});

export const tripStudentParamsSchema = z.object({
  userId: z.string().uuid(),
});

export type UpsertDriverProfileInput = z.infer<typeof upsertDriverProfileSchema>;
export type UpdateDriverServiceStatusInput = z.infer<typeof updateDriverServiceStatusSchema>;
export type StartDriverTripInput = z.infer<typeof startDriverTripSchema>;
export type UpdateTripStudentStatusInput = z.infer<typeof updateTripStudentStatusSchema>;
