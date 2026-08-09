import type { PoolConnection } from "mysql2/promise";
import type { Cron } from "../entities/Cron";

export interface CreateCronInput {
  name: string;
  date: string;
}

export interface UpdateCronInput {
  name: string;
  date: string;
}

export interface ICronRepository {
  list(limit: number, userId: number, conn?: PoolConnection): Promise<Cron[]>;
  findById(id: number, userId: number, conn?: PoolConnection): Promise<Cron | null>;
  existsByName(name: string, userId: number, conn?: PoolConnection): Promise<boolean>;
  create(userId: number, input: CreateCronInput, conn?: PoolConnection): Promise<number>;
  update(id: number, userId: number, input: UpdateCronInput, conn?: PoolConnection): Promise<void>;
  delete(id: number, userId: number, conn?: PoolConnection): Promise<void>;
}
