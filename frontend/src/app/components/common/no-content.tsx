import { Center, Text } from "@mantine/core";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export const NoContent = ({
  message = "Opps! No hay contenido por mostrar",
}: Params) => {
  return (
    <Center>
      <Text c="dimmed">{message}</Text>
    </Center>
  );
};
