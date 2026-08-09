export const genericUpdate = (
  table: string,
  datos: any,
  where: any
): { queryString: string; queryParams: any[] } => {
  const actualizaciones = Object.keys(datos)
    .filter((key) => datos[key] !== null && datos[key] !== undefined)
    .map((key) => `${key} = ?`)
    .join(", ");

  let whereString = "";
  let whereParams: any[] = [];
  if (where && Object.keys(where).length > 0) {
    whereString =
      "WHERE " +
      Object.keys(where)
        .map((key) => `${key} = ?`)
        .join(" AND ");

    whereParams = Object.values(where);
  }

  const queryString = `UPDATE ${table} SET ${actualizaciones} ${whereString} `;
  const queryParams = [
    ...Object.values(datos).filter(
      (value) => value !== null && value !== undefined
    ),
    ...whereParams,
  ];

  return { queryString, queryParams };
};

export const genericInsert = (
  table: string,
  datos: any
): { queryString: string; queryParams: any[] } => {
  const queryFields = Array.from(
    { length: Object.values(datos).length },
    () => `?`
  ).join(", ");

  const fields = Object.keys(datos)
    .map((key) => key)
    .join(", ");

  const queryString = `INSERT INTO ${table} (${fields}) VALUES(${queryFields})`;
  const queryParams = [...Object.values(datos)];

  return { queryString, queryParams };
};
