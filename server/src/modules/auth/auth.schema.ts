import { z } from 'zod';
import { uaeMobileNumberMessage, uaeMobileNumberPattern } from '../../utils/uae-mobile-number.js';

const mobileNumberSchema = z
  .string()
  .trim()
  .regex(uaeMobileNumberPattern, uaeMobileNumberMessage);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be 128 characters or fewer');

export const registerSchema = z
  .object({
    mobileNumber: mobileNumberSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Confirm password must match password',
  });

export const loginSchema = z.object({
  mobileNumber: mobileNumberSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  mobileNumber: mobileNumberSchema,
});

export const resetPasswordSchema = z
  .object({
    mobileNumber: mobileNumberSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
    resetToken: z.string().min(1, 'Reset link token is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Confirm password must match new password',
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
