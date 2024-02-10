import { hasLength } from "@mantine/form";

  export const updateCronValidation: any = {
    name: hasLength({ min: 1 }, "El nombre es requerido"),
    date: (value: Date) => {
      if (typeof value !== "object") {
        return;
      }
      if (!value || value?.getTime() === 0 || isNaN(value?.getTime())) {
        return "La fecha es requerida";
      }
    },
  };
