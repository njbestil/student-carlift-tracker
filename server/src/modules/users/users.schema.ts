import { z } from 'zod';
import { uaeMobileNumberMessage, uaeMobileNumberPattern } from '../../utils/uae-mobile-number.js';

export const updateUserSchema = z.object({
  mobileNumber: z
    .string()
    .trim()
    .regex(uaeMobileNumberPattern, uaeMobileNumberMessage)
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
