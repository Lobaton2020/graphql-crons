export function buildInsert(table: string, data: Record<string, unknown>): {
  query: string;
  params: unknown[];
} {
  const fields = Object.keys(data);
  const placeholders = fields.map(() => "?").join(", ");
  return {
    query: `INSERT INTO ${table} (${fields.join(", ")}) VALUES(${placeholders})`,
    params: fields.map((k) => data[k]),
  };
}

export function buildUpdate(
  table: string,
  data: Record<string, unknown>,
  where: Record<string, unknown>,
): { query: string; params: unknown[] } {
  const setEntries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined,
  );
  const setClause = setEntries.map(([k]) => `${k} = ?`).join(", ");
  const whereClause = Object.keys(where)
    .map((k) => `${k} = ?`)
    .join(" AND ");
  return {
    query: `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`,
    params: [...setEntries.map(([, v]) => v), ...Object.values(where)],
  };
}
