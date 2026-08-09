import DataLoader from "dataloader";
import type { Task } from "../models/entities/Task";
import type { Project } from "../models/entities/Project";
import type { ITaskRepository } from "../models/repositories/ITaskRepository";
import type { IProjectRepository } from "../models/repositories/IProjectRepository";

export interface DataLoaders {
  tasksByCronId: DataLoader<number, Task[]>;
  projectById: DataLoader<number, Project | null>;
}

export function createLoaders(
  userId: number,
  taskRepo: ITaskRepository,
  projectRepo: IProjectRepository,
): DataLoaders {
  return {
    tasksByCronId: new DataLoader<number, Task[]>(async (cronIds) => {
      const grouped = await Promise.all(
        cronIds.map((id) => taskRepo.listByCronId(id)),
      );
      return grouped;
    }),
    projectById: new DataLoader<number, Project | null>(async (projectIds) => {
      const uniqueIds = Array.from(new Set(projectIds));
      const projects = await projectRepo.findManyByIds(userId, uniqueIds);
      const byId = new Map(projects.map((p) => [p.id, p]));
      return projectIds.map((id) => byId.get(id) ?? null);
    }),
  };
}
