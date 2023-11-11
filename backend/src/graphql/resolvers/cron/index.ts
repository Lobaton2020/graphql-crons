import { CronResolver } from "../cron/cron.resolver"

export type IResolvers = any
const cronResolver = new CronResolver()

export const resolversCron:IResolvers = {
    Query:{
        crons: cronResolver.getCrons.bind(cronResolver),
        cron: cronResolver.getCronById.bind(cronResolver),
    },
    Mutation:{
        createCron: cronResolver.createCron.bind(cronResolver),
        editCron: cronResolver.editCron.bind(cronResolver)
    },
    Cron:{
        name: (...t:any[])=> {
            console.log({  t})
            return "P_ "+t[0].name
        },
        tasks: cronResolver.getTasksByCronId.bind(cronResolver)
    },
    Task:{
        project: cronResolver.getProjectByTaskId.bind(cronResolver)
    }
}
