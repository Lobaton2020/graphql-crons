import type { Cron } from "../../models/entities/Cron";
import type { ICronRepository } from "../../models/repositories/ICronRepository";
import type { ITaskRepository } from "../../models/repositories/ITaskRepository";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";
import { withTransaction } from "../../models/persistence/mysql/transaction";
import { logger } from "../../utils/logger";

export class CronController {
  constructor(
    private readonly cronRepo: ICronRepository,
    private readonly taskRepo: ITaskRepository,
  ) {}

  async list(limit: number, userId: number): Promise<Cron[]> {
    return this.cronRepo.list(limit, userId);
  }

  async getById(id: number, userId: number): Promise<Cron> {
    const cron = await this.cronRepo.findById(id, userId);
    if (!cron) throw new NotFoundError("Cron", id);
    return cron;
  }

  async create(
    userId: number,
    input: { name: string; date: string },
  ): Promise<number> {
    const exists = await this.cronRepo.existsByName(input.name, userId);
    if (exists) {
      throw new ConflictError("A cron with the same name already exists");
    }
    return this.cronRepo.create(userId, input);
  }

  async update(
    id: number,
    userId: number,
    input: { name: string; date: string },
  ): Promise<Cron> {
    return withTransaction(async (conn) => {
      const existing = await this.cronRepo.findById(id, userId, conn);
      if (!existing) throw new NotFoundError("Cron", id);
      await this.cronRepo.update(id, userId, input, conn);
      const updated = await this.cronRepo.findById(id, userId, conn);
      if (!updated) throw new NotFoundError("Cron", id);
      return updated;
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    return withTransaction(async (conn) => {
      const existing = await this.cronRepo.findById(id, userId, conn);
      if (!existing) throw new NotFoundError("Cron", id);
      await this.cronRepo.delete(id, userId, conn);
    });
  }

  async copy(sourceId: number, userId: number): Promise<number> {
    return withTransaction(async (conn) => {
      const source = await this.cronRepo.findById(sourceId, userId, conn);
      if (!source) throw new NotFoundError("Cron", sourceId);

      const newId = await this.cronRepo.create(
        userId,
        { name: `${source.name} Copy`, date: new Date().toISOString() },
        conn,
      );

      const tasks = await this.taskRepo.listByCronId(sourceId, conn);
      for (const task of tasks) {
        await this.taskRepo.create(
          newId,
          {
            description: task.description,
            hour: task.hour,
            minute: task.minute,
            projectId: task.projectId,
          },
          conn,
        );
      }
      await this.taskRepo.reorderByTime(newId, conn);
      logger.info({ sourceId, newId }, "cron copied");
      return newId;
    });
  }
}
