import { gql } from "@apollo/client";

export const REMOVE_TASK = gql`
  mutation RemoveTask($removeTaskId: ID!) {
    removeTask(id: $removeTaskId)
  }
`;
