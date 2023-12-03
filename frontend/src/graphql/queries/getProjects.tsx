import { gql } from "@apollo/client";

export const GET_TASKS = gql`
  query Projects {
    projects {
      name
      id
    }
  }
`;
