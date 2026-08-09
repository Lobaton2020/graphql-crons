import type { Task } from "../../models/entities/Task";
import type { ICronRepository } from "../../models/repositories/ICronRepository";
import type { ITaskRepository } from "../../models/repositories/ITaskRepository";
import { NotFoundError } from "../../errors/NotFoundError";
import { withTransaction } from "../../models/persistence/mysql/transaction";
import { logger } from "../../utils/logger";

export class TaskController {
  constructor(
    private readonly taskRepo: ITaskRepository,
    private readonly cronRepo: ICronRepository,
  ) {}

  async listByCronId(cronId: number, userId: number): Promise<Task[]> {
    const cron = await this.cronRepo.findById(cronId, userId);
    if (!cron) throw new NotFoundError("Cron", cronId);
    return this.taskRepo.listByCronId(cronId);
  }

  async create(
    cronId: number,
    userId: number,
    input: {
      description: string;
      hour: number | null;
      minute: number | null;
      projectId: number | null;
    },
  ): Promise<Task> {
    return withTransaction(async (conn) => {
      const cron = await this.cronRepo.findById(cronId, userId, conn);
      if (!cron) throw new NotFoundError("Cron", cronId);
      const taskId = await this.taskRepo.create(cronId, input, conn);
      await this.taskRepo.reorderByTime(cronId, conn);
      const task = await this.taskRepo.findById(taskId, conn);
      if (!task) throw new NotFoundError("Task", taskId);
      return task;
    });
  }

  async update(
    id: number,
    userId: number,
    input: {
      description?: string;
      hour?: number | null;
      minute?: number | null;
      state?: boolean;
      projectId?: number | null;
    },
  ): Promise<Task> {
    return withTransaction(async (conn) => {
      const task = await this.taskRepo.findById(id, conn);
      if (!task) throw new NotFoundError("Task", id);
      const cron = await this.cronRepo.findById(task.cronId, userId, conn);
      if (!cron) throw new NotFoundError("Cron", task.cronId);

      await this.taskRepo.update(id, input, conn);

      if (input.hour !== undefined || input.minute !== undefined) {
        await this.taskRepo.reorderByTime(task.cronId, conn);
      }

      const updated = await this.taskRepo.findById(id, conn);
      if (!updated) throw new NotFoundError("Task", id);
      return updated;
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await withTransaction(async (conn) => {
      const task = await this.taskRepo.findById(id, conn);
      if (!task) throw new NotFoundError("Task", id);
      const cron = await this.cronRepo.findById(task.cronId, userId, conn);
      if (!cron) throw new NotFoundError("Cron", task.cronId);
      await this.taskRepo.delete(id, conn);
      await this.taskRepo.reorderByTime(task.cronId, conn);
    });
  }

  async move(
    sourceCronId: number,
    destCronId: number,
    taskId: number,
    userId: number,
  ): Promise<Task> {
    return withTransaction(async (conn) => {
      const [source, dest, task] = await Promise.all([
        this.cronRepo.findById(sourceCronId, userId, conn),
        this.cronRepo.findById(destCronId, userId, conn),
        this.taskRepo.findById(taskId, conn),
      ]);
      if (!source) throw new NotFoundError("Source Cron", sourceCronId);
      if (!dest) throw new NotFoundError("Destination Cron", destCronId);
      if (!task) throw new NotFoundError("Task", taskId);
      if (task.cronId !== sourceCronId) {
        throw new NotFoundError("Task in source Cron", taskId);
      }

      const newTaskId = await this.taskRepo.create(
        destCronId,
        {
          description: task.description,
          hour: task.hour,
          minute: task.minute,
          projectId: task.projectId,
        },
        conn,
      );
      await this.taskRepo.delete(taskId, conn);

      await this.taskRepo.reorderByTime(sourceCronId, conn);
      await this.taskRepo.reorderByTime(destCronId, conn);

      logger.info({ taskId, sourceCronId, destCronId }, "task moved");

      const moved = await this.taskRepo.findById(newTaskId, conn);
      if (!moved) throw new NotFoundError("Task after move", newTaskId);
      return moved;
    });
  }
}
