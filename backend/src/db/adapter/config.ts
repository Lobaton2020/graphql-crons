import { createPool } from "mysql2/promise";
export const pool = createPool({
  host: process.env.DB_HOST,
  port: +`${process.env.DB_PORT}`,
  user: process.env.DB_USER,
  password: `${process.env.DB_PASSWORD}`,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
});

// pool.on("connection", (connection) => {
//   console.log("Conexión a la base de datos establecida");
// });
// pool.on("enqueue", () => {
//   console.error("Encolado");
// });

// pool.on("release", () => {
//   console.error("Error en la conexión a la base de datos: encolado");
// });
