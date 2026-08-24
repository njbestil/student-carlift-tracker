import { z } from 'zod';

export const upsertDriverProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

export type UpsertDriverProfileInput = z.infer<typeof upsertDriverProfileSchema>;
