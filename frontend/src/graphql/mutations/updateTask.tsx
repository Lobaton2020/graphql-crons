import { gql } from "@apollo/client";

export const UPDATE_TASK = gql`
  mutation EditTask($editTaskId: ID!, $task: EditTaskInput!) {
    editTask(id: $editTaskId, task: $task)
  }
`;
