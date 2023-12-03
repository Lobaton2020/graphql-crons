import { gql } from "@apollo/client";

export const REMOVE_CRON = gql`
  mutation RemoveCron($removeCronId: ID!) {
    removeCron(id: $removeCronId)
  }
`;
