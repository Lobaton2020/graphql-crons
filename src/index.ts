import { start } from "./server";
import { logger } from "./utils/logger";

start().catch((err) => {
  logger.fatal({ err }, "fatal bootstrap error");
  process.exit(1);
});
