import { pingDatabase } from "../../models/persistence/mysql/pool";

export class HealthController {
  async check(): Promise<{ status: "ok" | "degraded"; db: boolean }> {
    const db = await pingDatabase();
    return { status: db ? "ok" : "degraded", db };
  }
}
