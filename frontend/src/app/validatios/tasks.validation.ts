import { hasLength } from "@mantine/form";

export const createTaskValidation: any = {
  description: hasLength({ min: 1 }, "La descripcion es requerida"),
};
