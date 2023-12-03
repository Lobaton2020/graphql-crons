export default async function Home() {
  return <>HOME</>;
  // const client = createApolloClient();
  // const {
  //   data: {
  //     cron: { tasks },
  //   },
  // } = await client.query({
  //   query: gql`
  //     query Query($cronId: ID!, $withDate: Boolean!) {
  //       cron(id: $cronId) {
  //         date @include(if: $withDate)
  //         id
  //         name
  //         tasks {
  //           description
  //           hour
  //           minute
  //           id
  //           project {
  //             id
  //             name
  //           }
  //           state
  //         }
  //       }
  //     }
  //   `,
  //   variables: {
  //     cronId: 123,
  //     withDate: false,
  //   },
  // });
  // return (
  //   <main className="flex min-h-screen flex-col  p-24">
  //     Hola Mundo
  //     <br />
  //     <>
  //       {tasks.map((task: any, id: Key | null | undefined) => {
  //         return (
  //           <ul key={id}>
  //             <span>{task.state ? "Done" : "Pending"} </span>
  //             <span>{task.hour + ":" + task.minute} </span>
  //             <span>{task.description} </span>
  //             <span>{task.project?.name} </span>
  //           </ul>
  //         );
  //       })}
  //     </>
  //   </main>
  // );
}
