import { z } from 'zod';

const mobileNumberSchema = z
  .string()
  .trim()
  .regex(/^0[0-9]{9}$/, 'Mobile number must use a 10-digit local format such as 0501234567');

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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
