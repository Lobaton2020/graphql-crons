"use client";
import Link from "next/link";
import { Key, useState } from "react";
import { GET_CRONS } from "@app/graphql/queries/getCrons";
import {
  Grid,
  ActionIcon,
  Container,
  rem,
  Button,
  Anchor,
  Divider,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconCopy,
  IconDotsVertical,
  IconLetterH,
  IconTrash,
} from "@tabler/icons-react";
import { Card, Text, Group, Menu } from "@mantine/core";
import { UpdateCronForm } from "../components/crons/UpdateCronModal";
import { useGqlQuery } from "../hooks/useGqlQuery";
import { format } from "date-fns";

import setDefaultOptions from "date-fns/setDefaultOptions";
import { es } from "date-fns/locale";
import { CreateCronForm } from "../components/crons/CreateCronModal";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { modals } from "@mantine/modals";
import { useQqlMutation } from "../hooks/useQqlMutation";
import { REMOVE_CRON } from "@app/graphql/mutations/removeCron";
import { toast } from "react-toastify";
import { COPY_CRON } from "@app/graphql/mutations/copyCron";
setDefaultOptions({ locale: es });

export interface ISelectedModal {
  id?: number;
  name?: string;
  date?: string;
}
type ICron = ISelectedModal;
const MenuOpcionesCard = ({
  cron,
  handleClickEdit,
  handleClickRemove,
  handleClickCopy,
}: Params) => (
  <Menu width={200} shadow="md" variant="sm">
    <Menu.Target>
      <ActionIcon size={"sm"} color="dark" variant="white">
        <IconDotsVertical style={{ width: rem(20), height: rem(20) }} />
      </ActionIcon>
    </Menu.Target>

    <Menu.Dropdown>
      <Menu.Label>Opciones</Menu.Label>
      <Menu.Item
        leftSection={
          <IconLetterH style={{ width: rem(14), height: rem(14) }} />
        }
        onClick={() => handleClickEdit(cron)}
      >
        Cambiar titulo
      </Menu.Item>
      <Menu.Item
        leftSection={<IconCopy style={{ width: rem(14), height: rem(14) }} />}
        onClick={() => handleClickCopy(cron)}
      >
        Crear copia
      </Menu.Item>
      <Menu.Item
        leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
        onClick={() => handleClickRemove(cron)}
      >
        Eliminar
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);
export default function ListCrons() {
  const {
    data: { crons = [] },
    refetch,
    loading,
  } = useGqlQuery(GET_CRONS, { limit: 200 });
  const [removeCron] = useQqlMutation(REMOVE_CRON, {
    onDone: () => refetch(),
    onSuccess: () => toast.info("Cronograma eliminado"),
  });
  const [copyCron] = useQqlMutation(COPY_CRON, {
    onDone: () => refetch(),
    onStart: () => toast.info("Copiando cronograma!"),
    onSuccess: () => toast.info("Cronograma copiado!"),
  });
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedModal, setSelectedModal] = useState<ISelectedModal>({});
  const handleClickEdit = (cron: ISelectedModal) => {
    setSelectedModal(cron);
    setOpenEdit(true);
  };
  const handleClickCopy = (cron: ICron) => {
    copyCron({
      copyCronId: cron.id,
    });
  };

  const handleClickRemove = (cron: ICron) =>
    modals.openConfirmModal({
      title: "Eliminar cronograma",
      centered: true,
      children: <Text size="sm">Seguro quieres eliminar este cronograma?</Text>,
      labels: { confirm: "Confirmar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        removeCron({
          removeCronId: cron.id,
        });
      },
    });
  return (
    <>
      <Container size="lg" my={20}>
        {openEdit && (
          <UpdateCronForm
            open={openEdit}
            cron={selectedModal}
            refetch={refetch}
            setOpen={setOpenEdit}
          />
        )}
        {openCreate && (
          <CreateCronForm
            open={openCreate}
            cron={selectedModal}
            refetch={refetch}
            setOpen={setOpenCreate}
          />
        )}
        <Button onClick={() => setOpenCreate(true)}>Crear cronograma</Button>
        <Grid
          gutter={{ base: 5, xs: "sm", sm: "md", md: "md", xl: "md" }}
          style={{ marginTop: "1rem", marginBottom: "6rem" }}
        >
          <LoadingOverlay
            visible={loading}
            zIndex={1}
            overlayProps={{ radius: "sm", blur: 0 }}
          />
          {crons.map((cron: any, id: Key | null | undefined) => {
            return (
              <Grid.Col span={{ base: 12, md: 4, xs: 12, sm: 4 }} key={id}>
                <Card radius="md" withBorder p="xs" pl={20}>
                  <Anchor component={Link} href={`/crons/${cron.id}`}>
                    <Text
                      style={{
                        marginTop: "0.3rem",
                        marginBottom: "-0.5rem",
                      }}
                      fw={500}
                      size={"md"}
                    >
                      {cron.name}
                    </Text>
                  </Anchor>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text size="xs" c="dimmed">
                      {format(
                        new Date(cron.date),
                        "EEEE dd 'de' MMMM 'del' yyyy"
                      )}
                    </Text>
                    <MenuOpcionesCard
                      handleClickRemove={handleClickRemove}
                      handleClickEdit={handleClickEdit}
                      handleClickCopy={handleClickCopy}
                      cron={cron}
                    />
                  </Group>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
        <Divider />
      </Container>
    </>
  );
}
