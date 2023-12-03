"use client";

import { CreateOrEditTask } from "@app/app/components/crons/tasks/CreateOrEditTask";
import { ITask, ListTask } from "@app/app/components/crons/tasks/ListTask";
import { useGqlQuery } from "@app/app/hooks/useGqlQuery";
import { GET_CRONS_DETAIL } from "@app/graphql/queries/getCronsDetail";
import { Anchor, Container } from "@mantine/core";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import Link from "next/link";
import { useState } from "react";
export default function CronDetail({ params }: Params) {
  const {
    data: { cron: { name = "", tasks = [] } = {} },
    refetch,
    loading,
  } = useGqlQuery(GET_CRONS_DETAIL, { cronId: params.cronId });
  const [isEditTask, setIsEditTask] = useState(false);
  const [detailTask, setDetailTask] = useState({});
  const handleClickEdit = (task: ITask) => {
    setIsEditTask(true);
    setDetailTask(task);
  };
  return (
    <Container size={"lg"}>
      {isEditTask ? (
        <CreateOrEditTask
          task={detailTask}
          setIsEditTask={setIsEditTask}
          refetch={refetch}
        />
      ) : (
        <CreateOrEditTask refetch={refetch} />
      )}

      <ListTask
        handleClickEdit={handleClickEdit}
        loading={loading}
        name={name}
        tasks={tasks}
        refetch={refetch}
      />
      <Anchor component={Link} href="/crons" mb={30}>
        Regresar
      </Anchor>
    </Container>
  );
}
