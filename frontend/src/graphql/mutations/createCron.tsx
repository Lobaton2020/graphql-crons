import { gql } from "@apollo/client";

export const CREATE_CRON = gql`
  mutation CreateCron($cron: NewCronInput) {
    createCron(cron: $cron)
  }
`;
