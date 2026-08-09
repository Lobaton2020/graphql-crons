import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import type { Cron } from "../entities/Cron";
import type {
  CreateCronInput,
  ICronRepository,
  UpdateCronInput,
} from "../repositories/ICronRepository";

interface CronRow extends RowDataPacket {
  id: number;
  name: string;
  date: Date;
}

function mapRow(row: CronRow): Cron {
  return {
    id: row.id,
    name: row.name,
    date: row.date instanceof Date ? row.date.toISOString() : String(row.date),
  };
}

export class MySqlCronRepository implements ICronRepository {
  constructor(private readonly pool: Pool) {}

  private get executor(): Pool | PoolConnection {
    return this.pool;
  }

  async list(limit: number, userId: number, conn?: PoolConnection): Promise<Cron[]> {
    const [rows] = await (conn ?? this.executor).query<CronRow[]>(
      "SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma WHERE id_usuario_FK = ? ORDER BY id_cronograma_PK DESC LIMIT ?",
      [userId, limit],
    );
    return rows.map(mapRow);
  }

  async findById(
    id: number,
    userId: number,
    conn?: PoolConnection,
  ): Promise<Cron | null> {
    const [rows] = await (conn ?? this.executor).query<CronRow[]>(
      "SELECT id_cronograma_PK as id, titulo as name, fecha as date FROM cronograma WHERE id_cronograma_PK = ? AND id_usuario_FK = ?",
      [id, userId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async existsByName(
    name: string,
    userId: number,
    conn?: PoolConnection,
  ): Promise<boolean> {
    const [rows] = await (conn ?? this.executor).query<RowDataPacket[]>(
      "SELECT id_cronograma_PK FROM cronograma WHERE titulo = ? AND id_usuario_FK = ? LIMIT 1",
      [name, userId],
    );
    return rows.length > 0;
  }

  async create(
    userId: number,
    input: CreateCronInput,
    conn?: PoolConnection,
  ): Promise<number> {
    const [result] = await (conn ?? this.executor).query<import("mysql2").ResultSetHeader>(
      "INSERT INTO cronograma (id_usuario_FK, titulo, fecha) VALUES (?, ?, ?)",
      [userId, input.name, new Date(input.date)],
    );
    return result.insertId;
  }

  async update(
    id: number,
    userId: number,
    input: UpdateCronInput,
    conn?: PoolConnection,
  ): Promise<void> {
    await (conn ?? this.executor).query(
      "UPDATE cronograma SET titulo = ?, fecha = ? WHERE id_cronograma_PK = ? AND id_usuario_FK = ?",
      [input.name, new Date(input.date), id, userId],
    );
  }

  async delete(id: number, userId: number, conn?: PoolConnection): Promise<void> {
    await (conn ?? this.executor).query(
      "DELETE FROM tarea_cronograma WHERE id_cronograma_FK IN (SELECT id_cronograma_PK FROM cronograma WHERE id_cronograma_PK = ? AND id_usuario_FK = ?)",
      [id, userId],
    );
    await (conn ?? this.executor).query(
      "DELETE FROM cronograma WHERE id_cronograma_PK = ? AND id_usuario_FK = ?",
      [id, userId],
    );
  }
}
