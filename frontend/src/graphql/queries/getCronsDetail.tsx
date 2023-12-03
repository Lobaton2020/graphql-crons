import { gql } from "@apollo/client";

export const GET_CRONS_DETAIL = gql`
  query Query($cronId: ID!) {
    cron(id: $cronId) {
      date
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
`;
