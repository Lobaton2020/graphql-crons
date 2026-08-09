import type { GraphQLFormattedError } from "graphql";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export function formatError(
  formatted: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const original = error as { originalError?: Error };

  if (original?.originalError instanceof AppError) {
    const e = original.originalError;
    return {
      message: e.message,
      path: formatted.path,
      locations: formatted.locations,
      extensions: {
        code: e.code,
        http: { status: e.statusCode },
      },
    };
  }

  if (original?.originalError instanceof ZodError) {
    return {
      message: original.originalError.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
      path: formatted.path,
      locations: formatted.locations,
      extensions: {
        code: "VALIDATION",
        http: { status: 422 },
      },
    };
  }

  if (env.NODE_ENV !== "production") {
    logger.error({ err: original }, "unexpected graphql error");
  }

  return {
    message: formatted.message,
    path: formatted.path,
    locations: formatted.locations,
    extensions: { code: "INTERNAL" },
  };
}
