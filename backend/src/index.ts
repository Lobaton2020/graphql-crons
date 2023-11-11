import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { config } from "dotenv";
config();
import { schema } from "./graphql";
import { CronDao } from "./db/dao/cronograma.dao";
export interface ApolloContext {
  cronDao: CronDao;
}

async function bootstrap() {
  const app = express();
  app.use(cors());
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    nodeEnv: process.env.NODE_ENV || "development",
    context: () => ({
      cronDao: new CronDao(),
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(process.env.PORT ?? 3000, () => {
    console.log("App Running on port " + process.env.PORT ?? 3000);
  });
}

bootstrap();
