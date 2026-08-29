import { z } from 'zod';
import { STUDENT_TRIP_ORIGINS } from '../../constants/roles.js';

export const upsertDriverProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  profilePhotoUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/, 'Profile photo must be an image'),
      z.literal(''),
    ])
    .optional()
    .refine((value) => !value || value.length <= 1_400_000, 'Profile photo must be smaller than 1 MB'),
  address: z.string().trim().min(1).max(500).optional(),
  vehicleType: z.string().trim().min(1).max(120).optional(),
  vehiclePlateNumber: z.string().trim().min(1).max(32).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
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
