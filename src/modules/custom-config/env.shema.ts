import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod']),
  PORT: z.coerce.number().default(3000),
  DB_URI: z.url(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  ACCESS_TOKEN_MAX_AGE: z.coerce.number().default(900000),
  REFRESH_TOKEN_MAX_AGE: z.coerce.number().default(604800000),
  API_VERSION: z.string(),
  ALLOWED_ORIGINS: z.string(),
  SUPER_ADMIN_EMAIL: z.string(),
  SUPER_ADMIN_PASSWORD: z.string(),
  SUPER_ADMIN_USERNAME: z.string(),
});

export type Env = z.infer<typeof envSchema>;
