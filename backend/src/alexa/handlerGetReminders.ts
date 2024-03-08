import { Request, Response } from "express";
import { CronDao } from "../db/dao/cronograma.dao";
import { pool } from "../db/adapter/config";
const dao = new CronDao(pool);
export default async (req: Request, res: Response) => {
  const date = (req.query.date ?? "") as string;
  const dateI = new Date(date);
  if (
    !date ||
    dateI.toLocaleString() === "Invalid Date" ||
    date.split("").filter((x) => x === "-").length !== 2
  ) {
    return res
      .status(400)
      .json({ message: "El query param 'date' es invalido" });
  }
  const data = await dao.getTasksByCronDate(req.query.date as string);
  return res.json(data);
};
