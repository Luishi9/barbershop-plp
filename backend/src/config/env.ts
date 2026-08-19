/**
 * Validates and exports the environment variables required to run the backend.
 * Fails fast at boot time if anything is missing or malformed.
 */
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  PORT: z
    .string()
    .default('4000')
    .transform((v) => Number.parseInt(v, 10))
    .pipe(z.number().int().positive()),
  DEMO_PASSWORD: z.string().min(8).default('Barberia2026!'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000')
    .transform((v) => Number.parseInt(v, 10))
    .pipe(z.number().int().positive()),
  RATE_LIMIT_MAX: z
    .string()
    .default('100')
    .transform((v) => Number.parseInt(v, 10))
    .pipe(z.number().int().positive()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Configuración de entorno inválida:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
