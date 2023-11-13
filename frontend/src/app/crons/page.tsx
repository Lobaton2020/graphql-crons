import { gql } from "@apollo/client";
import createApolloClient from "@app/graphql";
import Link from "next/link";
import { Key } from "react";

export default async function CronDetail({ params }) {
  const client = createApolloClient();
  const {
    data: { crons },
  } = await client.query({
    query: gql`
      query Query {
        crons {
          date
          id
          name
        }
      }
    `,
  });
  return (
    <div>
      <>
        {crons.map((cron: any, id: Key | null | undefined) => {
          console.log(cron);
          return (
            <div>
              <ul key={id}>
                <Link href={`/crons/${cron.id}`}>
                  <p>{cron.name} </p>
                </Link>
                <span>{new Date(+cron.date).toLocaleString()} </span>
              </ul>
              <hr />
            </div>
          );
        })}
      </>
    </div>
  );
}
