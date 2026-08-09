import type { CronController } from "../controllers/cron/CronController";
import type { TaskController } from "../controllers/cron/TaskController";
import type { ProjectController } from "../controllers/cron/ProjectController";
import type { FCMTokenController } from "../controllers/cron/FCMTokenController";
import type { DataLoaders } from "./dataloaders";

export interface GraphQLContext {
  userId: number;
  dataloaders: DataLoaders;
  cronController: CronController;
  taskController: TaskController;
  projectController: ProjectController;
  fcmTokenController: FCMTokenController;
}
