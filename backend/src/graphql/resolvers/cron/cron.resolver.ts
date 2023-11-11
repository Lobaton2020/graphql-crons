import { ApolloContext } from "../../..";
import { Cron, CronDao } from "../../../db/dao/cronograma.dao";

interface GetCronsArgs{
    id: number
}
export interface CreateCronDto {
    name:string
    date:string
}
interface ResolverArgsMutationCreateCron{
    id?:number
    cron: CreateCronDto
}
interface ResolverArgsMutationEditCron extends ResolverArgsMutationCreateCron{
    id:number
}

export class CronResolver{
    async getCrons(root:void, args:void, ctx:ApolloContext):Promise<Cron[]>{
        return await ctx.cronDao.getCrons()
    }
    async getCronById(root:any, args:GetCronsArgs, ctx:ApolloContext):Promise<Cron>{
        return await ctx.cronDao.getCronById(args.id)
    }
    async getTasksByCronId(root: GetCronsArgs, args:void, ctx:ApolloContext){
        return await ctx.cronDao.getTasksByCronId(root.id)
    }
    async getProjectByTaskId(root: GetCronsArgs, args:void, ctx:ApolloContext){
        return await ctx.cronDao.getProjectByTaskId(root.id)
    }
    async createCron(root: void, args: ResolverArgsMutationCreateCron, ctx:ApolloContext){
        const existCron = await ctx.cronDao.existCronByName(args.cron.name)
        if(existCron){
            return "YA_EXISTE_EL_CRON"
        }
        await ctx.cronDao.createCron(1, args.cron)
        return "OK"
    }
    async editCron(root: void, args: ResolverArgsMutationEditCron, ctx:ApolloContext){
        await ctx.cronDao.editCron(args.id, args.cron)
        return ctx.cronDao.getCronById(args.id)
    }
}