import { createPool, type Pool } from "mysql2/promise";
import { env } from "../../../config/env";
import { logger } from "../../../utils/logger";

export const pool: Pool = createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 100,
  enableKeepAlive: true,
  connectTimeout: 5000,
});

export async function pingDatabase(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await Promise.race([
      conn.query("SELECT 1"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("ping timeout")), 3000),
      ),
    ]);
    conn.release();
    return true;
  } catch (err) {
    logger.error({ err }, "database ping failed");
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
