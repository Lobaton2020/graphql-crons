import { Cron } from "../../../db/dao/cronograma.dao";
import { CronResolver } from "../cron/cron.resolver";

export type IResolvers = any;
const cronResolver = new CronResolver();

export const resolversCron: IResolvers = {
  Query: {
    crons: cronResolver.getCrons.bind(cronResolver),
    cron: cronResolver.getCronById.bind(cronResolver),
    projects: cronResolver.getProjects.bind(cronResolver),
  },
  Mutation: {
    createCron: cronResolver.createCron.bind(cronResolver),
    editCron: cronResolver.editCron.bind(cronResolver),
    editTask: cronResolver.editTask.bind(cronResolver),
    createTask: cronResolver.createTask.bind(cronResolver),
    removeCron: cronResolver.removeCron.bind(cronResolver),
    copyCron: cronResolver.copyCron.bind(cronResolver),
    removeTask: cronResolver.removeTask.bind(cronResolver),
    moveTask: cronResolver.moveTask.bind(cronResolver),
  },
  Cron: {
    name: (root: Cron) => {
      return root.name;
    },
    tasks: cronResolver.getTasksByCronId.bind(cronResolver),
  },
  Task: {
    project: cronResolver.getProjectByTaskId.bind(cronResolver),
  },
};
