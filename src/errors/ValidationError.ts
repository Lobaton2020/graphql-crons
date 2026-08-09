import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION", 422);
  }
}
