import { ApolloContext } from "../../..";
import { Cron, CronDao, Task } from "../../../db/dao/cronograma.dao";

interface GetCronsArgs {
  id: number;
}
export interface CreateCronDto {
  name: string;
  date: string;
}
interface ResolverArgsMutationCreateCron {
  id?: number;
  cron: CreateCronDto;
}
interface ResolverArgsMutationEditCron extends ResolverArgsMutationCreateCron {
  id: number;
}
interface ResolverArgsMutationEditTask {
  id: number;
  task: Task;
}
interface ResolverArgsMutationCreateTask {
  cronograma_id: number;
  task: Task;
}

interface ArgsGetCrons {
  limit: number;
}
interface ResolverArgsMutationId {
  id: string;
}
export interface ArgsMoveTaskCron{
  source_cronogram_id: string;
  destine_cronogram_id: string;
  task_id: string;
}
export class CronResolver {
  async getCrons(
    root: void,
    args: ArgsGetCrons,
    ctx: ApolloContext
  ): Promise<Cron[]> {
    return await ctx.cronDao.getCrons(args.limit);
  }
  async getCronById(
    root: any,
    args: GetCronsArgs,
    ctx: ApolloContext
  ): Promise<Cron> {
    return await ctx.cronDao.getCronById(args.id);
  }
  async getTasksByCronId(root: GetCronsArgs, args: void, ctx: ApolloContext) {
    return await ctx.cronDao.getTasksByCronId(root.id);
  }
  async getProjectByTaskId(root: GetCronsArgs, args: void, ctx: ApolloContext) {
    return await ctx.cronDao.getProjectByTaskId(root.id);
  }
  async createCron(
    root: void,
    args: ResolverArgsMutationCreateCron,
    ctx: ApolloContext
  ) {
    const existCron = await ctx.cronDao.existCronByName(args.cron.name);
    if (existCron) {
      throw new Error("El cronograma ya existe con el mismo nombre");
    }
    await ctx.cronDao.createCron(1, args.cron);
    return "OK";
  }
  async editCron(
    root: void,
    args: ResolverArgsMutationEditCron,
    ctx: ApolloContext
  ) {
    await ctx.cronDao.editCron(args.id, args.cron);
    return ctx.cronDao.getCronById(args.id);
  }
  async editTask(
    root: void,
    args: ResolverArgsMutationEditTask,
    ctx: ApolloContext
  ) {
    await ctx.cronDao.editTask(args.id, args.task);
    return "OK";
  }
  async getProjects(oot: void, args: void, ctx: ApolloContext) {
    return await ctx.cronDao.getProjects();
  }
  async createTask(
    root: void,
    args: ResolverArgsMutationCreateTask,
    ctx: ApolloContext
  ) {
    await ctx.cronDao.createTask(args.cronograma_id, args.task);
    return "OK";
  }

  async removeCron(
    root: void,
    args: ResolverArgsMutationId,
    ctx: ApolloContext
  ) {
    await ctx.cronDao.removeCron(args.id);
  }
  async removeTask(
    root: void,
    args: ResolverArgsMutationId,
    ctx: ApolloContext
  ) {
    await ctx.cronDao.removeTask(args.id);
  }
  async copyCron(
    root: void,
    args: ResolverArgsMutationId,
    ctx: ApolloContext
  ) {
    await ctx.cronDao.copyCron(args.id);
  }

  async moveTask(
    root: void,
    args: ArgsMoveTaskCron,
    ctx: ApolloContext
  ) {
    await ctx.cronDao.moveTask(args);
  }

}