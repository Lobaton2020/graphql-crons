import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import type { FCMToken } from "../entities/FCMToken";
import type {
  IFCMTokenRepository,
  RegisterDeviceInput,
} from "../repositories/IFCMTokenRepository";

interface FCMTokenRow extends RowDataPacket {
  id_fcm_token_PK: number;
  id_usuario_FK: number;
  token: string;
  platform: string;
  device_id: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: FCMTokenRow): FCMToken {
  return {
    id: row.id_fcm_token_PK,
    userId: row.id_usuario_FK,
    token: row.token,
    platform: row.platform,
    deviceId: row.device_id,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
  };
}

export class MySqlFCMTokenRepository implements IFCMTokenRepository {
  constructor(private readonly pool: Pool) {}

  async upsert(
    input: RegisterDeviceInput,
    conn?: PoolConnection,
  ): Promise<FCMToken> {
    const exec = conn ?? this.pool;
    const platform = input.platform ?? "android";

    const [updateResult] = await exec.query<import("mysql2").ResultSetHeader>(
      `UPDATE fcm_tokens
       SET token = ?, platform = ?, device_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id_usuario_FK = ? AND device_id = ?`,
      [input.token, platform, input.deviceId, input.userId, input.deviceId],
    );

    if (updateResult.affectedRows === 0) {
      await exec.query(
        `INSERT INTO fcm_tokens (id_usuario_FK, token, platform, device_id)
         VALUES (?, ?, ?, ?)`,
        [input.userId, input.token, platform, input.deviceId],
      );
    }

    const found = await this.findByDeviceId(input.userId, input.deviceId, conn);
    if (!found) {
      throw new Error("FCM token upsert failed: row not found after write");
    }
    return found;
  }

  async findByDeviceId(
    userId: number,
    deviceId: string,
    conn?: PoolConnection,
  ): Promise<FCMToken | null> {
    const [rows] = await (conn ?? this.pool).query<FCMTokenRow[]>(
      `SELECT id_fcm_token_PK, id_usuario_FK, token, platform, device_id,
              created_at, updated_at
       FROM fcm_tokens
       WHERE id_usuario_FK = ? AND device_id = ?
       LIMIT 1`,
      [userId, deviceId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }
}
