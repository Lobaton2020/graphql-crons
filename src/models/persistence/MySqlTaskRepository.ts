import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import type { Task } from "../entities/Task";
import type {
  CreateTaskInput,
  ITaskRepository,
  UpdateTaskInput,
} from "../repositories/ITaskRepository";
import { buildInsert, buildUpdate } from "./mysql/sqlHelpers";

interface TaskRow extends RowDataPacket {
  id: number;
  description: string;
  state: number | boolean;
  hour: number | null;
  minute: number | null;
  order: number;
  project_id: number | null;
  id_cronograma_FK: number;
}

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    description: row.description,
    state: Boolean(row.state),
    hour: row.hour,
    minute: row.minute,
    order: row.order,
    projectId: row.project_id,
    cronId: row.id_cronograma_FK,
  };
}

export class MySqlTaskRepository implements ITaskRepository {
  constructor(private readonly pool: Pool) {}

  async listByCronId(cronId: number, conn?: PoolConnection): Promise<Task[]> {
    const [rows] = await (conn ?? this.pool).query<TaskRow[]>(
      `SELECT id_tarea_cronograma_PK as id,
              descripcion as description,
              estado as state,
              hora as hour,
              minuto as minute,
              \`order\`,
              project_id,
              id_cronograma_FK
       FROM tarea_cronograma
       WHERE id_cronograma_FK = ?
       ORDER BY \`order\` ASC`,
      [cronId],
    );
    return rows.map(mapRow);
  }

  async findById(id: number, conn?: PoolConnection): Promise<Task | null> {
    const [rows] = await (conn ?? this.pool).query<TaskRow[]>(
      `SELECT id_tarea_cronograma_PK as id,
              descripcion as description,
              estado as state,
              hora as hour,
              minuto as minute,
              \`order\`,
              project_id,
              id_cronograma_FK
       FROM tarea_cronograma
       WHERE id_tarea_cronograma_PK = ?`,
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async getCronIdByTaskId(
    taskId: number,
    conn?: PoolConnection,
  ): Promise<number | null> {
    const [rows] = await (conn ?? this.pool).query<RowDataPacket[]>(
      "SELECT id_cronograma_FK FROM tarea_cronograma WHERE id_tarea_cronograma_PK = ?",
      [taskId],
    );
    const row = rows[0] as { id_cronograma_FK: number } | undefined;
    return row ? row.id_cronograma_FK : null;
  }

  async create(
    cronId: number,
    input: CreateTaskInput,
    conn?: PoolConnection,
  ): Promise<number> {
    const { query, params } = buildInsert("tarea_cronograma", {
      descripcion: input.description,
      hora: input.hour,
      minuto: input.minute,
      estado: false,
      project_id: input.projectId,
      id_cronograma_FK: cronId,
    });
    const [result] = await (conn ?? this.pool).query<import("mysql2").ResultSetHeader>(
      query,
      params,
    );
    return result.insertId;
  }

  async update(
    id: number,
    input: UpdateTaskInput,
    conn?: PoolConnection,
  ): Promise<void> {
    const { query, params } = buildUpdate(
      "tarea_cronograma",
      {
        descripcion: input.description,
        hora: input.hour,
        minuto: input.minute,
        estado: input.state === undefined ? undefined : input.state ? 1 : 0,
        project_id: input.projectId,
      },
      { id_tarea_cronograma_PK: id },
    );
    await (conn ?? this.pool).query(query, params);
  }

  async delete(id: number, conn?: PoolConnection): Promise<void> {
    await (conn ?? this.pool).query(
      "DELETE FROM tarea_cronograma WHERE id_tarea_cronograma_PK = ?",
      [id],
    );
  }

  async reorderByTime(cronId: number, conn?: PoolConnection): Promise<void> {
    const exec = conn ?? this.pool;
    await exec.query("SET @row = 0");
    await exec.query(
      `UPDATE tarea_cronograma
       SET \`order\` = (@row := @row + 1)
       WHERE id_cronograma_FK = ?
       ORDER BY hora ASC, minuto ASC`,
      [cronId],
    );
  }
}
