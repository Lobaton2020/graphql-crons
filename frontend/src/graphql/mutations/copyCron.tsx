import { gql } from "@apollo/client";

export const COPY_CRON = gql`
  mutation CopyCron($copyCronId: ID!) {
    copyCron(id: $copyCronId)
  }
`;
