import type { Project } from "../../models/entities/Project";
import type { IProjectRepository } from "../../models/repositories/IProjectRepository";

export class ProjectController {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async listActive(userId: number): Promise<Project[]> {
    return this.projectRepo.listActiveByUser(userId);
  }
}
