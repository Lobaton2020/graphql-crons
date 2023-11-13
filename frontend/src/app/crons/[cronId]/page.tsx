import { gql } from "@apollo/client";
import createApolloClient from "@app/graphql";
import Link from "next/link";
import { Key } from "react";

export default async function CronDetail({ params }) {
  const client = createApolloClient();
  const {
    data: {
      cron: { tasks, name },
    },
  } = await client.query({
    query: gql`
      query Query($cronId: ID!, $withDate: Boolean!) {
        cron(id: $cronId) {
          date @include(if: $withDate)
          id
          name
          tasks {
            description
            hour
            minute
            id
            project {
              id
              name
            }
            state
          }
        }
      }
    `,
    variables: {
      cronId: params.cronId,
      withDate: false,
    },
  });
  return (
    <main className="flex min-h-screen flex-col  p-24">
      {name}
      <br />
      <>
        {tasks.map((task: any, id: Key | null | undefined) => {
          return (
            <ul key={id}>
              <span>{task.state ? "Done" : "Pending"} </span>
              <span>{task.hour + ":" + task.minute} </span>
              <span>{task.description} </span>
              <span>{task.project?.name} </span>
            </ul>
          );
        })}
        <strong>
          <Link href="/crons">Regresar</Link>
        </strong>
      </>
    </main>
  );
}
