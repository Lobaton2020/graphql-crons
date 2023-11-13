import { CreateCronDto } from "../../graphql/resolvers/cron/cron.resolver"
import { pool } from "../adapter/config";

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
  async getConnection(): Promise<any> {
    const connection = await pool.getConnection();
    connection.release = interceptor(
      connection.release.bind(connection),
      connection
    ) as any;
    return connection;
  }
  async getCrons(): Promise<Cron[]> {
    const connection = await this.getConnection();
    const [data]: any = await connection.query(
      "SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma"
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
                minuto as minute
                FROM tarea_cronograma WHERE id_cronograma_FK = ?`,
      [id]
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
}
