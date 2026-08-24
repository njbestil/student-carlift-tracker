import { z } from 'zod';

export const upsertStudentProfileSchema = z.object({
  studentFullName: z.string().trim().min(1).max(120),
  parentFullName: z.string().trim().min(1).max(120),
  completeAddress: z.string().trim().min(1).max(1000),
  emergencyNumber: z
    .string()
    .trim()
    .regex(/^0[0-9]{9}$/, 'Emergency number must use a 10-digit local format'),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

export type UpsertStudentProfileInput = z.infer<typeof upsertStudentProfileSchema>;
