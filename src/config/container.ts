import { pool } from "../models/persistence/mysql/pool";
import { MySqlCronRepository } from "../models/persistence/MySqlCronRepository";
import { MySqlTaskRepository } from "../models/persistence/MySqlTaskRepository";
import { MySqlProjectRepository } from "../models/persistence/MySqlProjectRepository";
import { MySqlFCMTokenRepository } from "../models/persistence/MySqlFCMTokenRepository";
import { CronController } from "../controllers/cron/CronController";
import { TaskController } from "../controllers/cron/TaskController";
import { ProjectController } from "../controllers/cron/ProjectController";
import { FCMTokenController } from "../controllers/cron/FCMTokenController";
import { HealthController } from "../controllers/shared/HealthController";

const cronRepo = new MySqlCronRepository(pool);
const taskRepo = new MySqlTaskRepository(pool);
const projectRepo = new MySqlProjectRepository(pool);
const fcmTokenRepo = new MySqlFCMTokenRepository(pool);

const cronController = new CronController(cronRepo, taskRepo);
const taskController = new TaskController(taskRepo, cronRepo);
const projectController = new ProjectController(projectRepo);
const fcmTokenController = new FCMTokenController(fcmTokenRepo);
const healthController = new HealthController();

export const container = {
  repos: { cronRepo, taskRepo, projectRepo, fcmTokenRepo },
  controllers: {
    cronController,
    taskController,
    projectController,
    fcmTokenController,
    healthController,
  },
};
