import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import type { Project } from "../entities/Project";
import type { IProjectRepository } from "../repositories/IProjectRepository";

interface ProjectRow extends RowDataPacket {
  id: number;
  name: string;
  status: number | boolean;
}

function mapRow(r: ProjectRow): Project {
  return { id: r.id, name: r.name, status: Boolean(r.status) };
}

export class MySqlProjectRepository implements IProjectRepository {
  constructor(private readonly pool: Pool) {}

  async listActiveByUser(
    userId: number,
    conn?: PoolConnection,
  ): Promise<Project[]> {
    const [rows] = await (conn ?? this.pool).query<ProjectRow[]>(
      "SELECT id, name, status FROM projects WHERE user_id = ? AND status = 1 ORDER BY name ASC",
      [userId],
    );
    return rows.map(mapRow);
  }

  async findManyByIds(
    userId: number,
    ids: number[],
    conn?: PoolConnection,
  ): Promise<Project[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await (conn ?? this.pool).query<ProjectRow[]>(
      `SELECT id, name, status
       FROM projects
       WHERE user_id = ? AND id IN (${placeholders})`,
      [userId, ...ids],
    );
    return rows.map(mapRow);
  }
}
