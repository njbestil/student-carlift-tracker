import { z } from 'zod';
import { uaeMobileNumberMessage, uaeMobileNumberPattern } from '../../utils/uae-mobile-number.js';

export const serviceStatusUpdateSchema = z.object({
  serviceStatus: z.enum(['ABSENT', 'WAITING', 'PICKED_UP', 'DROPPED_OFF']),
});

export const studentUserIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const upsertStudentProfileSchema = z.object({
  studentFullName: z.string().trim().min(1).max(120),
  parentFullName: z.string().trim().min(1).max(120),
  completeAddress: z.string().trim().min(1).max(1000),
  emergencyNumber: z
    .string()
    .trim()
    .regex(uaeMobileNumberPattern, uaeMobileNumberMessage),
  profilePhotoUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/, 'Profile photo must be an image'),
      z.literal(''),
    ])
    .optional()
    .refine((value) => !value || value.length <= 1_400_000, 'Profile photo must be smaller than 1 MB'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type UpsertStudentProfileInput = z.infer<typeof upsertStudentProfileSchema>;
export type ServiceStatusUpdateInput = z.infer<typeof serviceStatusUpdateSchema>;
