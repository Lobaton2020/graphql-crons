import { Center, Text } from "@mantine/core";

export const NoContent = ({
  message = "Opps! No hay contenido por mostrar",
}) => {
  return (
    <Center>
      <Text c="dimmed">{message}</Text>
    </Center>
  );
};
