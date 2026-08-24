import { z } from 'zod';

export const updateUserSchema = z.object({
  mobileNumber: z
    .string()
    .trim()
    .regex(/^0[0-9]{9}$/, 'Mobile number must use a 10-digit local format')
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
