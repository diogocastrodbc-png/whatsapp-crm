import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ZAPI_BASE_URL: z.string().default('https://api.z-api.io'),
  ZAPI_INSTANCE_ID: z.string(),
  ZAPI_TOKEN: z.string(),
  // Security Token gerado em app.z-api.io → Settings → Security
  ZAPI_CLIENT_TOKEN: z.string(),
  // URL where Z-API can reach this backend's webhook
  WEBHOOK_BASE_URL: z.string().default('http://localhost:3001'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[env] Missing or invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
