import type { GraphQLContext } from "../../context";
import { inputParsers, requireUserId } from "../../../controllers/validators";
import type { Task } from "../../../models/entities/Task";

export const taskResolvers = {
  Mutation: {
    createTask: async (
      _: unknown,
      args: { cronogramaId: string | number; task: unknown },
      ctx: GraphQLContext,
    ): Promise<Task> => {
      const cronId = inputParsers.cronId(args.cronogramaId);
      const input = inputParsers.newTask(args.task);
      return ctx.taskController.create(cronId, requireUserId(ctx), {
        description: input.description,
        hour: input.hour ?? null,
        minute: input.minute ?? null,
        projectId: input.projectId ?? null,
      });
    },
    editTask: async (
      _: unknown,
      args: { id: string | number; task: unknown },
      ctx: GraphQLContext,
    ): Promise<Task> => {
      const id = inputParsers.cronId(args.id);
      const input = inputParsers.editTask(args.task);
      return ctx.taskController.update(id, requireUserId(ctx), {
        description: input.description,
        hour: input.hour,
        minute: input.minute,
        state: input.state,
        projectId: input.projectId,
      });
    },
    removeTask: async (
      _: unknown,
      args: { id: string | number },
      ctx: GraphQLContext,
    ): Promise<boolean> => {
      const id = inputParsers.cronId(args.id);
      await ctx.taskController.remove(id, requireUserId(ctx));
      return true;
    },
    moveTask: async (
      _: unknown,
      args: {
        sourceCronogramaId: string | number;
        destineCronogramaId: string | number;
        taskId: string | number;
      },
      ctx: GraphQLContext,
    ): Promise<Task> => {
      const sourceId = inputParsers.cronId(args.sourceCronogramaId);
      const destId = inputParsers.cronId(args.destineCronogramaId);
      const taskId = inputParsers.cronId(args.taskId);
      return ctx.taskController.move(sourceId, destId, taskId, requireUserId(ctx));
    },
  },

  Task: {
    project: async (
      parent: Task,
      _: unknown,
      ctx: GraphQLContext,
    ) => {
      if (parent.projectId == null) return null;
      return ctx.dataloaders.projectById.load(parent.projectId);
    },
  },
};
