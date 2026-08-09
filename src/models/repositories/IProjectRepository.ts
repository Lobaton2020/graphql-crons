import type { PoolConnection } from "mysql2/promise";
import type { Project } from "../entities/Project";

export interface IProjectRepository {
  listActiveByUser(userId: number, conn?: PoolConnection): Promise<Project[]>;
  findManyByIds(
    userId: number,
    ids: number[],
    conn?: PoolConnection,
  ): Promise<Project[]>;
}
