import { gql } from "@apollo/client";

export const CREATE_TASK = gql`
  mutation CreateTask($cronogramaId: String!, $task: EditTaskInput!) {
    createTask(cronograma_id: $cronogramaId, task: $task)
  }
`;
