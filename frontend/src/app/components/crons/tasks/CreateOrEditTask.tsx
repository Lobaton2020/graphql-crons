import { useGqlQuery } from "@app/app/hooks/useGqlQuery";
import { GET_TASKS } from "@app/graphql/queries/getProjects";
import { Button, Card, Grid, Group, Select, TextInput } from "@mantine/core";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { Project } from "./ListTask";
import { useForm } from "@mantine/form";
import { createTaskValidation } from "@app/app/validatios/tasks.validation";
import { useQqlMutation } from "@app/app/hooks/useQqlMutation";
import { CREATE_TASK } from "@app/graphql/mutations/createTask";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { UPDATE_TASK } from "@app/graphql/mutations/updateTask";
import { useEffect } from "react";
const addZero = (number: number): string => {
  if (number === undefined || number === null) {
    return "";
  }
  return number < 10 ? `0${number}` : `${number}`;
};
export const CreateOrEditTask = ({ task, setIsEditTask, refetch }: any) => {
  const { cronId } = useParams();
  const {
    data: { projects = [{ name: "Default" }] },
  } = useGqlQuery(GET_TASKS);
  const [mutate] = useQqlMutation(task ? UPDATE_TASK : CREATE_TASK, {
    onSuccess: () => {
      refetch();
      form.reset();
      toast.success(`Tarea ${task ? "actualizada" : "añadida"}`);
      setIsEditTask && setIsEditTask(false);
    },
  });
  const form = useForm({
    initialValues: {
      description: "",
      hour: "00",
      minute: "00",
      project: {
        id: null,
        name: "Default",
      },
    },
    validate: createTaskValidation,
  });
  const handleSubmitForm = (data: any) => {
    if (form.validate().hasErrors) {
      return;
    }
    data.project.id = projects.find(
      ({ name }: Project) => name === data.project.name
    ).id;
    const paramId = task ? { editTaskId: task.id } : { cronogramaId: cronId };

    mutate({
      ...paramId,
      task: {
        ...data,
        hour: parseInt(data.hour),
        minute: parseInt(data.minute),
      },
    });
  };
  useEffect(() => {
    if (!task) return;
    form.setValues({
      description: task?.description,
      hour: addZero(task?.hour),
      minute: addZero(task?.minute),
      project: {
        id: task?.project?.id,
        name: task?.project?.name,
      },
    });
  }, [task]);
  return (
    <form onSubmit={form.onSubmit((values) => handleSubmitForm(values))}>
      <Grid my={20}>
        <Grid.Col span={{ xs: 4, sm: 4, md: 2 }} display={"flex"}>
          <Group justify="center">
            <Select
              data={Array.from({ length: 24 }, (_, index) => addZero(index))}
              searchable
              style={{ marginRight: "0.3rem" }}
              {...form.getInputProps("hour")}
            />
          </Group>
          <Group>
            <Select
              data={Array.from({ length: 30 }, (_, index) =>
                addZero(index * 2)
              )}
              searchable
              {...form.getInputProps("minute")}
            />
          </Group>
        </Grid.Col>
        <Grid.Col span={{ xs: 8, sm: 8, md: 7 }}>
          <TextInput
            placeholder="Escribe tu tarea"
            {...form.getInputProps("description")}
          />
        </Grid.Col>

        <Grid.Col span={{ xs: 12, sm: 12, md: 3 }} display={"flex"}>
          <Select
            data={projects.map(({ name }: Project) => name)}
            style={{ marginRight: "0.3rem", minWidth: "9rem" }}
            searchable
            {...form.getInputProps("project.name")}
          />
          <Button color={task ? "yellow" : "blue"} type="submit" fullWidth>
            {task ? <IconEdit /> : <IconPlus />}
          </Button>
        </Grid.Col>
      </Grid>
    </form>
  );
};
