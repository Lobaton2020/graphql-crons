import express, { Request, Response } from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { config } from "dotenv";
config();
import { schema } from "./graphql";
import { CronDao } from "./db/dao/cronograma.dao";
import handlerGetReminders from "./alexa/handlerGetReminders";
import { pool } from "./db/adapter/config";
export interface ApolloContext {
  cronDao: CronDao;
}

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/reminders", handlerGetReminders);
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    nodeEnv: process.env.NODE_ENV || "development",
    context: () => ({
      cronDao: new CronDao(pool),
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(process.env.PORT ?? 3000, () => {
    console.log("App Running on port " + process.env.PORT ?? 3000);
  });
}

bootstrap();
