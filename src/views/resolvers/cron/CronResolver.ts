import type { GraphQLContext } from "../../context";
import { inputParsers, requireUserId } from "../../../controllers/validators";
import type { Cron } from "../../../models/entities/Cron";
import { logger } from "../../../utils/logger";

export const cronResolvers = {
  Query: {
    crons: async (
      _: unknown,
      args: { limit: number },
      ctx: GraphQLContext,
    ): Promise<Cron[]> => {
      try {
        const result = await ctx.cronController.list(args.limit, requireUserId(ctx));
        return result ?? [];
      } catch (err) {
        logger.error({ err }, "crons resolver error");
        throw err;
      }
    },
    cron: async (
      _: unknown,
      args: { id: string | number },
      ctx: GraphQLContext,
    ): Promise<Cron | null> => {
      const id = inputParsers.cronId(args.id);
      return ctx.cronController.getById(id, requireUserId(ctx));
    },
    projects: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext,
    ) => {
      const result = await ctx.projectController.listActive(requireUserId(ctx));
      return result ?? [];
    },
  },

  Mutation: {
    createCron: async (
      _: unknown,
      args: { cron: unknown },
      ctx: GraphQLContext,
    ): Promise<Cron> => {
      const input = inputParsers.newCron(args.cron);
      const id = await ctx.cronController.create(requireUserId(ctx), input);
      return ctx.cronController.getById(id, requireUserId(ctx));
    },
    editCron: async (
      _: unknown,
      args: { id: string | number; cron: unknown },
      ctx: GraphQLContext,
    ): Promise<Cron> => {
      const id = inputParsers.cronId(args.id);
      const input = inputParsers.editCron(args.cron);
      return ctx.cronController.update(id, requireUserId(ctx), input);
    },
    removeCron: async (
      _: unknown,
      args: { id: string | number },
      ctx: GraphQLContext,
    ): Promise<boolean> => {
      const id = inputParsers.cronId(args.id);
      await ctx.cronController.remove(id, requireUserId(ctx));
      return true;
    },
    copyCron: async (
      _: unknown,
      args: { id: string | number },
      ctx: GraphQLContext,
    ): Promise<Cron> => {
      const id = inputParsers.cronId(args.id);
      const newId = await ctx.cronController.copy(id, requireUserId(ctx));
      return ctx.cronController.getById(newId, requireUserId(ctx));
    },
  },

  Cron: {
    tasks: async (
      parent: Cron,
      _: unknown,
      ctx: GraphQLContext,
    ) => ctx.dataloaders.tasksByCronId.load(parent.id),
  },
};
