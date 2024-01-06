import { gql } from "@apollo/client";

export const MOVE_TASK = gql`
mutation Mutation($sourceCronogramId: ID!, $taskId: ID!, $destineCronogramId: ID!) {
  moveTask(source_cronogram_id: $sourceCronogramId, task_id: $taskId, destine_cronogram_id: $destineCronogramId)
}

`;
