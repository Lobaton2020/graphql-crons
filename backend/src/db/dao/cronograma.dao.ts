import { CreateCronDto } from "../../graphql/resolvers/cron/cron.resolver"
import { pool } from "../adapter/config";
import { genericInsert, genericUpdate } from "./common";

export interface Cron {
  id: string;
  name: string;
  date: Date;
}
export interface Task {
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
  async getConnection(): Promise<any> {
    const connection = await pool.getConnection();
    connection.release = interceptor(
      connection.release.bind(connection),
      connection
    ) as any;
    return connection;
  }
  async getCrons(limit: number): Promise<Cron[]> {
    const connection = await this.getConnection();
    const [data]: any = await connection.query(
      "SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma ORDER BY id_cronograma_PK DESC LIMIT ?  ",
      [limit]
    );
    await connection.release();
    return data;
  }
  async getCronById(id: number): Promise<Cron> {
    if (cache[id]) {
      return cache[id];
    }
    const connection = await this.getConnection();
    const sql =
      "SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma WHERE id_cronograma_PK = ?";
    const [data]: any = await connection.query(sql, [id]);
    await connection.release();
    cache[id] = data[0];
    return data[0];
  }

  async getTasksByCronId(id: number) {
    const connection = await this.getConnection();
    const [data]: any = await connection.query(
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
    await connection.release();
    return data;
  }
  async getTasksByCronDate(date: string) {
    const connection = await this.getConnection();
    const [data]: any = await connection.query(
      `SELECT  tc.descripcion as description,
          tc.hora as hour,
          tc.minuto as minute
          FROM tarea_cronograma tc
          INNER JOIN cronograma c on tc.id_cronograma_FK = c.id_cronograma_PK
          WHERE DATE(c.fecha) = ?`,
      [date]
    );
    await connection.release();
    return data;
  }

  async getProjectByTaskId(id: number) {
    const connection = await this.getConnection();
    const [data]: any = await connection.query(
      `SELECT
                p.id as id,
                p.name as name
                FROM tarea_cronograma t
                 INNER JOIN projects p ON p.id = t.project_id
                WHERE t.id_tarea_cronograma_PK = ?`,
      [id]
    );
    await connection.release();
    return data[0];
  }

  async createCron(userId: number, data: CreateCronDto): Promise<void> {
    const connection = await this.getConnection();
    await connection.query(
      "INSERT INTO cronograma(id_usuario_FK, titulo, fecha) VALUES(?, ?, ?);",
      [userId, data.name, new Date(data.date)]
    );
    await connection.release();
  }
  async editCron(id: number, data: CreateCronDto): Promise<void> {
    const connection = await this.getConnection();
    await connection.query(
      "UPDATE cronograma SET titulo = ?, fecha = ? WHERE id_cronograma_PK = ?;",
      [data.name, new Date(data.date), id]
    );
    await connection.release();
  }
  async existCronByName(name: string) {
    const connection = await this.getConnection();
    const [data]: any = await connection.query(
      "SELECT id_cronograma_PK FROM cronograma WHERE titulo = ?;",
      [name]
    );
    await connection.release();
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
    const connection = await this.getConnection();
    await connection.query(queryString, queryParams);
    await connection.release();
    return "OK";
  }

  async getProjects() {
    const connection = await this.getConnection();
    const [data]: any = await connection.query(
      "SELECT name, id from projects where user_id = ? AND status = true",
      [this.userId]
    );
    await connection.release();
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
    const connection = await this.getConnection();
    await connection.query(queryString, queryParams);
    await connection.release();
    return "OK";
  }

  async removeTask(id: string) {
    const connection = await this.getConnection();
    await connection.query(
      "DELETE FROM tarea_cronograma WHERE id_tarea_cronograma_PK = ?",
      [id]
    );
    await connection.release();
  }
  async removeCron(id: string) {
    const connection = await this.getConnection();
    await connection.query(
      `DELETE FROM tarea_cronograma WHERE id_cronograma_FK = ?`,
      [id]
    );
    await connection.query(
      "DELETE FROM cronograma WHERE id_usuario_FK = ? AND id_cronograma_PK = ?",
      [this.userId, id]
    );
    await connection.release();
  }

  async copyCron(cronogramaId: string) {
    const connection = await this.getConnection();
    const cronograma = await this.getCronById(parseInt(cronogramaId));
    const sql = `INSERT INTO cronograma (id_usuario_FK, titulo, fecha)VALUES (?, CONCAT(?, ' Copy'), ?);`;

    const [insertResult] = await connection.query(sql, [
      this.userId,
      cronograma.name,
      new Date().toISOString(),
    ]);
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
      await connection.query(queryString, queryParams);
    }

    await connection.release();
  }
}
