import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    super(
      id !== undefined ? `${resource} not found: ${id}` : `${resource} not found`,
      "NOT_FOUND",
      404,
    );
  }
}
