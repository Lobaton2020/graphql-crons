import { PoolConnection } from "mysql2/typings/mysql/lib/PoolConnection";
import {
  ArgsMoveTaskCron,
  CreateCronDto,
} from "../../graphql/resolvers/cron/cron.resolver";
import { compararPorHoraMinuto } from "../../utils/ordenarHorasMinutos";
import { pool } from "../adapter/config";
import { genericInsert, genericUpdate } from "./common";
import { Pool } from "mysql2/promise";

export interface Cron {
  id: string;
  name: string;
  date: Date;
}
export interface Task {
  id: number;
  description: string;
  state: boolean;
  hour: number;
  minute: number;
  project: {
    id: number;
    name: string;
  };
}
let cache: any = {};
setInterval(() => {
  cache = {};
}, 120000);
function interceptor(fn: any, that?: any): Function {
  const func = async function (...args: any[]): Promise<void> {
    const result = await fn(...args);
    return result;
  };
  return func.bind(that);
}

export class CronDao {
  private userId = 1;
  constructor(readonly db: Pool) {}
  async getCrons(limit: number): Promise<Cron[]> {
    const [data]: any = await this.db.query(
      "SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma ORDER BY id_cronograma_PK DESC LIMIT ?  ",
      [limit]
    );
    return data;
  }
  async getCronById(id: number): Promise<Cron> {
    const sql =
      "SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma WHERE id_cronograma_PK = ?";
    const [[data]]: any = await this.db.query(sql, [id]);
    return data;
  }

  async getTasksByCronId(id: number) {
    const [data]: any = await this.db.query(
      `SELECT
                id_tarea_cronograma_PK as id,
                descripcion as description,
                estado as state,
                hora as hour,
                minuto as minute,
                project_id
                FROM tarea_cronograma WHERE id_cronograma_FK = ?`,
      [id]
    );
    return data;
  }
  async getTasksByCronDate(date: string) {
    const [data]: any = await this.db.query(
      `SELECT  tc.descripcion as description,
                tc.hora as hour,
                tc.minuto as minute
                FROM tarea_cronograma tc
                INNER JOIN cronograma c on tc.id_cronograma_FK = c.id_cronograma_PK
                where DATE_FORMAT(DATE_SUB(c.fecha, INTERVAL 5 HOUR), '%Y-%m-%d') = ?`,
      [date]
    );
    return data;
  }

  async getProjectByTaskId(id: number) {
    const [data] = (await this.db.query(
      `SELECT
                p.id as id,
                p.name as name
                FROM tarea_cronograma t
                 INNER JOIN projects p ON p.id = t.project_id
                WHERE t.id_tarea_cronograma_PK = ?`,
      [id]
    )) as any;
    return data[0];
  }

  async createCron(userId: number, data: CreateCronDto): Promise<void> {
    await this.db.query(
      "INSERT INTO cronograma(id_usuario_FK, titulo, fecha) VALUES(?, ?, ?);",
      [userId, data.name, new Date(data.date)]
    );
    /*
   TODO: if some order fails I need to use this script
   Array.from({ length: 348 },(x, i)=> i + 1).splice(325).map( i =>
    this.autoOrganizeOrder(i).then(x=>console.log("DONE::"+i)).catch((err) =>
      console.log(`Error order cronogram:editTask ${err}`)
    ))*/
  }
  async editCron(id: number, data: CreateCronDto): Promise<void> {
    await this.db.query(
      "UPDATE cronograma SET titulo = ?, fecha = ? WHERE id_cronograma_PK = ?;",
      [data.name, new Date(data.date), id]
    );
  }
  async existCronByName(name: string) {
    const [data]: any = await this.db.query(
      "SELECT id_cronograma_PK FROM cronograma WHERE titulo = ?;",
      [name]
    );
    return data[0];
  }

  async editTask(id: number, task: Task) {
    const insertObject = {
      descripcion: task.description,
      hora: task.hour,
      minuto: task.minute,
      estado: task.state,
      project_id: task.project?.id,
    };

    const { queryParams, queryString } = genericUpdate(
      "tarea_cronograma",
      insertObject,
      {
        id_tarea_cronograma_PK: id,
      }
    );
    await this.db.query(queryString, queryParams);
    const sql =
      "SELECT id_cronograma_FK from tarea_cronograma where id_tarea_cronograma_PK = ?";
    const [[{ id_cronograma_FK }]] = (await this.db.query(sql, [id])) as any;
    this.autoOrganizeOrder(id_cronograma_FK).catch((err) =>
      console.log(`Error order cronogram:editTask ${err}`)
    );
    return "OK";
  }

  async getProjects() {
    const [data]: any = await this.db.query(
      "SELECT name, id from projects where user_id = ? AND status = true",
      [this.userId]
    );
    return data;
  }
  async createTask(cronograma_id: number, task: Task) {
    const insertObject = {
      descripcion: task.description,
      hora: task.hour,
      minuto: task.minute,
      estado: false,
      project_id: task.project?.id,
      id_cronograma_FK: cronograma_id,
    };
    const { queryParams, queryString } = genericInsert(
      "tarea_cronograma",
      insertObject
    );
    await this.db.query(queryString, queryParams);
    this.autoOrganizeOrder(cronograma_id).catch((err) =>
      console.log(`Error order cronogram:createTask ${err}`)
    );
    return "OK";
  }

  async removeTask(id: string) {
    const sql =
      "SELECT id_cronograma_FK from tarea_cronograma where id_tarea_cronograma_PK = ?";
    const [[{ id_cronograma_FK }]] = (await this.db.query(sql, [id])) as any;
    await this.db.query(
      "DELETE FROM tarea_cronograma WHERE id_tarea_cronograma_PK = ?",
      [id]
    );
    this.autoOrganizeOrder(id_cronograma_FK).catch((err) =>
      console.log(`Error order cronogram:removeTask ${err}`)
    );
  }
  async removeCron(id: string) {
    await this.db.query(
      `DELETE FROM tarea_cronograma WHERE id_cronograma_FK = ?`,
      [id]
    );
    await this.db.query(
      "DELETE FROM cronograma WHERE id_usuario_FK = ? AND id_cronograma_PK = ?",
      [this.userId, id]
    );
  }

  async copyCron(cronogramaId: string) {
    const cronograma = await this.getCronById(parseInt(cronogramaId));
    const sql = `INSERT INTO cronograma (id_usuario_FK, titulo, fecha)VALUES (?, CONCAT(?, ' Copy'), ?);`;

    const [insertResult] = (await this.db.query(sql, [
      this.userId,
      cronograma.name,
      new Date().toISOString(),
    ])) as any;
    const newCronogramaId = insertResult.insertId;
    const tareas = await this.getTasksByCronId(parseInt(cronogramaId));
    for (const tarea of tareas) {
      const tareaCronograma = {
        id_cronograma_FK: newCronogramaId,
        descripcion: tarea.description,
        hora: tarea.hour,
        minuto: tarea.minute,
        estado: 0,
        project_id: tarea.project_id || null,
      };
      const { queryParams, queryString } = genericInsert(
        "tarea_cronograma",
        tareaCronograma
      );
      await this.db.query(queryString, queryParams);
    }
    this.autoOrganizeOrder(newCronogramaId).catch((err) =>
      console.log(`Error order cronogram:removeTask ${err}`)
    );
  }
  async getTaskById(id: number) {
    const [data]: any = await this.db.query(
      `SELECT id_tarea_cronograma_PK as id,
              descripcion as description,
              estado as state,
              hora as hour,
              minuto as minute,
              project_id
          FROM tarea_cronograma WHERE id_tarea_cronograma_PK = ?`,
      [id]
    );
    return data;
  }
  async autoOrganizeOrder(idCronograma: number): Promise<boolean> {
    const listTasks: Task[] = await this.getTasksByCronId(idCronograma);
    listTasks.sort((a, b) => compararPorHoraMinuto(a, b));
    let counter = 1;
    for (const task of listTasks) {
      const sql =
        "UPDATE tarea_cronograma SET `order` = ? WHERE id_cronograma_FK = ? AND id_tarea_cronograma_PK = ?";
      const queryParams = [counter, idCronograma, task.id];

      await this.db.query(sql, queryParams);
      counter++;
    }
    return true;
  }

  async moveTask({
    destine_cronogram_id,
    source_cronogram_id,
    task_id,
  }: ArgsMoveTaskCron) {
    const isMineCronogramaFuente = await this.getCronById(
      parseInt(source_cronogram_id)
    );
    const isMineCronogramaDestino = await this.getCronById(
      parseInt(destine_cronogram_id)
    );

    if (!isMineCronogramaFuente || !isMineCronogramaDestino) {
      throw new Error("No está autorizado para esta operación");
    }

    const [task] = await this.getTaskById(parseInt(task_id));
    if (!task) {
      throw new Error("No existe tarea con ese ID");
    }
    task.id_cronograma_FK = destine_cronogram_id;

    const insertObject = {
      descripcion: task.description,
      hora: task.hour,
      minuto: task.minute,
      estado: task.state,
      project_id: task.project_id,
      id_cronograma_FK: task.id_cronograma_FK,
    };

    const { queryParams, queryString } = genericInsert(
      "tarea_cronograma",
      insertObject
    );
    await this.db.query(queryString, queryParams);
    await this.removeTask(task_id);
    this.autoOrganizeOrder(parseInt(destine_cronogram_id)).catch((err) =>
      console.log(`Error order cronogram: ${err}`)
    );
  }
}
