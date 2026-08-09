import type { PoolConnection } from "mysql2/promise";
import type { Task } from "../entities/Task";

export interface CreateTaskInput {
  description: string;
  hour: number | null;
  minute: number | null;
  projectId: number | null;
}

export interface UpdateTaskInput {
  description?: string;
  hour?: number | null;
  minute?: number | null;
  state?: boolean;
  projectId?: number | null;
}

export interface ITaskRepository {
  listByCronId(cronId: number, conn?: PoolConnection): Promise<Task[]>;
  findById(id: number, conn?: PoolConnection): Promise<Task | null>;
  getCronIdByTaskId(taskId: number, conn?: PoolConnection): Promise<number | null>;
  create(cronId: number, input: CreateTaskInput, conn?: PoolConnection): Promise<number>;
  update(id: number, input: UpdateTaskInput, conn?: PoolConnection): Promise<void>;
  delete(id: number, conn?: PoolConnection): Promise<void>;
  reorderByTime(cronId: number, conn?: PoolConnection): Promise<void>;
}
