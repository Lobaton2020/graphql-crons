import { createConnection, Connection } from "mysql";
export const connection: Connection = createConnection({
  host: process.env.DB_HOST,
  port: +`${process.env.DB_PORT}`,
  user: process.env.DB_USER,
  password: atob(`${process.env.DB_PASSWORD}`),
  database: process.env.DB_NAME,
});
