import { cronResolvers } from "./CronResolver";
import { taskResolvers } from "./TaskResolver";
import { fcmTokenResolvers } from "./FCMTokenResolver";

export const resolvers = {
  Query: {
    ...cronResolvers.Query,
  },
  Mutation: {
    ...cronResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...fcmTokenResolvers.Mutation,
  },
  Cron: cronResolvers.Cron,
  Task: taskResolvers.Task,
};
