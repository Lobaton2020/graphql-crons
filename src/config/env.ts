import { config } from "dotenv";
import { resolve } from "path";
import { z } from "zod";

const envPath = resolve(process.cwd(), ".env");
const result = config({ path: envPath });

if (result.error) {
  console.warn(`[env] no .env file loaded from ${envPath} (${result.error.message})`);
} else {
  console.log(`[env] loaded .env from ${envPath}`);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
