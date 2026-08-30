import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
  CLIENT_URL: z.string().url(),
  PASSWORD_RESET_ACCESS_TOKEN: z
    .string()
    .min(32, 'PASSWORD_RESET_ACCESS_TOKEN must be at least 32 characters long'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error('Invalid server environment configuration', parsedEnvironment.error.flatten().fieldErrors);
  process.exit(1);
}

export const environment = parsedEnvironment.data;
