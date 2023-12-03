import { gql } from "@apollo/client";

export const GET_CRONS = gql`
  query Query($limit: Int!) {
    crons(limit: $limit) {
      date
      id
      name
    }
  }
`;
