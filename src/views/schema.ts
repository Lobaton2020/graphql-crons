import { readFileSync } from "fs";
import { join } from "path";

export const typeDefs = readFileSync(
  join(__dirname, "schema", "cron.graphql"),
  "utf-8",
);
