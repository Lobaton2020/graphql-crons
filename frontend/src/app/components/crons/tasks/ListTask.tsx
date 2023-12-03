import { UPDATE_TASK } from "@app/graphql/mutations/updateTask";
import {
  Box,
  Card,
  Center,
  Divider,
  Grid,
  Switch,
  Text,
  Title,
  rem,
  LoadingOverlay,
  Menu,
  ActionIcon,
  Flex,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconPointFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useQqlMutation } from "@app/app/hooks/useQqlMutation";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { NoContent } from "../../common/no-content";
import { handleSortTasks } from "@app/app/utils/sordTasks";
import { REMOVE_TASK } from "@app/graphql/mutations/removeTask";
import { modals } from "@mantine/modals";
import { getWeekInfo } from "@app/app/utils/progressYear";
export interface Project {
  id: number;
  name: string;
}
export interface ITask {
  id: number;
  description: string;
  state: boolean;
  hour: number;
  minute: number;
  project: Project;
}
export interface IProps {
  tasks: ITask[];
  name: string;
}
const completeNumber = (number: number) => {
  return number.toString().length === 1 ? `0${number}` : `${number}`;
};
const MenuOpcionesCard = ({
  task,
  handleClickEdit,
  handleClickRemove,
}: any) => (
  <Menu width={200} shadow="md" variant="xs">
    <Menu.Target>
      <Center>
        <ActionIcon color="dark" size={"sm"} variant="white">
          <IconDotsVertical style={{ width: rem(20), height: rem(20) }} />
        </ActionIcon>
      </Center>
    </Menu.Target>

    <Menu.Dropdown>
      <Menu.Label>Opciones</Menu.Label>
      <Menu.Item
        leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
        onClick={() => handleClickEdit(task)}
      >
        Editar
      </Menu.Item>
      <Menu.Item
        leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
        onClick={() => handleClickRemove(task)}
      >
        Eliminar
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

const DetailTask = ({
  task: { id, hour, minute, state, description, project },
  handleChangeSwitch,
  handleClickEdit,
  handleClickRemove,
  refetch,
}: any) => {
  const fs = state ? "italic" : "inherit";
  const td = state ? "line-through" : "";
  return (
    <Flex justify={"space-between"}>
      <Center>
        <Switch
          size="xs"
          style={{
            marginRight: "0.3rem",
          }}
          onChange={() => handleChangeSwitch(id, state)}
          defaultChecked={state}
        />
        <div>
          <Center display={"inline"}>
            <Text display={"inline"} fs={fs} td={td} size="sm">
              {completeNumber(hour)}:{completeNumber(minute)}
            </Text>
            <IconPointFilled style={{ width: rem(10), height: rem(10) }} />
            <Text
              style={{
                marginRight: "0.3rem",
              }}
              display={"inline"}
              fs={fs}
              td={td}
              size="sm"
            >
              {description}
            </Text>
          </Center>
          <Text display={"inline"} fs={fs} td={td} c="dimmed" size="xs">
            {project.name}
          </Text>
        </div>
      </Center>
      <div>
        <MenuOpcionesCard
          task={{ id, hour, minute, state, description, project }}
          handleClickEdit={handleClickEdit}
          handleClickRemove={handleClickRemove}
        />
      </div>
    </Flex>
  );
};

export const ListTask = ({
  tasks,
  name,
  refetch,
  loading,
  handleClickEdit,
}: any) => {
  const [mutate] = useQqlMutation(UPDATE_TASK, {
    onDone: () => refetch(),
    onSuccess: () => toast.success("Tarea Actualizada"),
  });
  const [removeTask] = useQqlMutation(REMOVE_TASK, {
    onDone: () => refetch(),
    onSuccess: () => toast.info("Tarea eliminada"),
  });
  const [tasksOrdered, setTasksOrdered] = useState<ITask[]>([]);
  useEffect(() => {
    setTasksOrdered([...tasks].sort(handleSortTasks));
  }, [tasks]);

  const handleChangeSwitch = (id: number, state: boolean) => {
    mutate({
      editTaskId: id,
      task: {
        state: !state,
      },
    });
  };
  const handleClickRemove = (task: ITask) =>
    modals.openConfirmModal({
      title: "Eliminar tarea",
      centered: true,
      children: <Text size="sm">Seguro quieres eliminar esta tarea?</Text>,
      labels: { confirm: "Confirmar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: () => {
        removeTask({
          removeTaskId: task.id,
        });
      },
    });
  const { week, progress } = getWeekInfo(new Date());
  return (
    <Card radius="md" withBorder p="xs">
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 0 }}
      />
      <Flex display={"flex"} justify={"space-evenly"}>
        <div>
          {/* <Center> */}
          <Title order={3}>
            {name}
            {": "}
          </Title>
          {/* </Center> */}
        </div>
        <Text size="md" my={5}>
          Week {week}/52 - {progress}
        </Text>
      </Flex>
      <Box
        style={{
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      >
        {!tasksOrdered.length && <NoContent />}
        {tasksOrdered.map((task, i, all) => (
          <Grid key={i}>
            <Grid.Col span="auto"></Grid.Col>
            <Grid.Col span={10}>
              <DetailTask
                task={task}
                handleClickEdit={handleClickEdit}
                handleClickRemove={handleClickRemove}
                handleChangeSwitch={handleChangeSwitch}
              />
              {i + 1 !== all.length && (
                <Divider
                  style={{
                    marginLeft: "2.3rem",
                    marginTop: ".3rem",
                    marginBottom: ".3rem",
                  }}
                  variant="solid"
                />
              )}
            </Grid.Col>
            <Grid.Col span="auto"></Grid.Col>
          </Grid>
        ))}
      </Box>
    </Card>
  );
};
