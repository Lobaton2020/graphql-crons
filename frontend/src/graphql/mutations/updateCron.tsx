import { gql } from "@apollo/client";

export const UPDATE_CRON = gql`
  mutation EditCron($editCronId: ID!, $cron: EditCronInput!) {
    editCron(cron: $cron, id: $editCronId) {
      id
    }
  }
`;
