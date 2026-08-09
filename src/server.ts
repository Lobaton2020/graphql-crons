import "./config/env";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { env } from "./config/env";
import { container } from "./config/container";
import { typeDefs } from "./views/schema";
import { resolvers } from "./views/resolvers/cron";
import { formatError } from "./views/errorFormatter";
import { createLoaders, type DataLoaders } from "./views/dataloaders";
import type { GraphQLContext } from "./views/context";
import { closePool } from "./models/persistence/mysql/pool";
import { logger } from "./utils/logger";

const HARDCODED_USER_ID = 1;

export async function start(): Promise<void> {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", async (_req: Request, res: Response) => {
    const result = await container.controllers.healthController.check();
    res.status(result.db ? 200 : 503).json(result);
  });

  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers: resolvers as never,
    introspection: env.NODE_ENV !== "production",
    formatError,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await apollo.start();

  app.use(
    "/graphql",
    expressMiddleware(apollo, {
      context: async (): Promise<GraphQLContext> => {
        const dataloaders: DataLoaders = createLoaders(
          HARDCODED_USER_ID,
          container.repos.taskRepo,
          container.repos.projectRepo,
        );
        return {
          userId: HARDCODED_USER_ID,
          dataloaders,
          cronController: container.controllers.cronController,
          taskController: container.controllers.taskController,
          projectController: container.controllers.projectController,
          fcmTokenController: container.controllers.fcmTokenController,
        };
      },
    }),
  );

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "server started");
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "shutting down");
    server.close();
    await apollo.stop();
    await closePool();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
