import type { IFCMTokenRepository } from "../../models/repositories/IFCMTokenRepository";
import { withTransaction } from "../../models/persistence/mysql/transaction";
import { logger } from "../../utils/logger";

export class FCMTokenController {
  constructor(private readonly fcmTokenRepo: IFCMTokenRepository) {}

  async register(
    userId: number,
    deviceId: string,
    token: string,
    platform: string = "android",
  ): Promise<string> {
    await withTransaction(async (conn) => {
      await this.fcmTokenRepo.upsert(
        { userId, deviceId, token, platform },
        conn,
      );
    });
    logger.info({ userId, deviceId }, "device registered");
    return "OK";
  }
}
