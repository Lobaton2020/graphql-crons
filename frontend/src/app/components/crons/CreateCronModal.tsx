"use client";
import { useEffect } from "react";
import { Box, Group, Loader, TextInput } from "@mantine/core";
import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ISelectedModal } from "@app/app/crons/page";
import { useQqlMutation } from "@app/app/hooks/useQqlMutation";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { updateCronValidation } from "@app/app/validatios/crons.validation";
import { toast } from "react-toastify";
import { CREATE_CRON } from "@app/graphql/mutations/createCron";
export interface PropsModal {
  cron: ISelectedModal;
  refetch: Function;
  open: boolean;
  setOpen: Function;
}

export function CreateCronForm({ refetch, open, setOpen }: PropsModal) {
  const [opened, { open: openFunc, close }] = useDisclosure(false);
  const [mutate, { loading }] = useQqlMutation(CREATE_CRON, {
    onDone: () => refetch(),
    onSuccess: () => toast.success("Cronograma creado"),
    onError: (error) => toast.error(`${error.message}`),
  });
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  };
  const form = useForm({
    initialValues: {
      name: "",
      date: getDefaultDate(),
    },
    validate: updateCronValidation,
  });
  const handleSubmit = async (values: ISelectedModal) => {
    if (!form.validate().hasErrors) {
      mutate({
        cron: {
          name: values.name,
          date: values.date,
        },
      });
      setOpen(false);
      close();
    }
  };
  const handleDateChange = (value: any) => {
    form.setFieldValue("date", new Date(value ?? "") as any);
  };
  useEffect(() => {
    if (open) {
      openFunc();
    }
    form.reset();
  }, [open]);

  return (
    <Modal
      style={{ marginTop: "20rem", background: "red" }}
      opened={opened}
      onClose={() => {
        setOpen(false);
        close();
      }}
      title={"Crear cronograma"}
      radius={5}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Box mx="auto">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <TextInput
            label="Actualiza el titulo"
            {...form.getInputProps("name")}
          />
          <DateInput
            dateParser={(input) => new Date(input ?? "")}
            clearable
            defaultValue={
              new Date(form.getInputProps("date")?.value ?? new Date())
            }
            label="Fecha cronograma"
            onChange={handleDateChange}
            error={form.getInputProps("date").error}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" disabled={loading}>
              Crea{loading ? "ndo" : "r"}
              {"  "}
              {loading && <Loader size={8} />}
            </Button>
          </Group>
        </form>
      </Box>
    </Modal>
    // </FormProvider>
  );
}
