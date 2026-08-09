import type { PoolConnection } from "mysql2/promise";
import type { FCMToken } from "../entities/FCMToken";

export interface RegisterDeviceInput {
  userId: number;
  deviceId: string;
  token: string;
  platform?: string;
}

export interface IFCMTokenRepository {
  upsert(
    input: RegisterDeviceInput,
    conn?: PoolConnection,
  ): Promise<FCMToken>;
  findByDeviceId(
    userId: number,
    deviceId: string,
    conn?: PoolConnection,
  ): Promise<FCMToken | null>;
}
