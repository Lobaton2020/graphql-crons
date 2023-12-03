import { ApolloClient, InMemoryCache } from "@apollo/client";

export const apolloClient = new ApolloClient({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_API ||
    "https://graphql-api-theta.vercel.app/graphql",
  cache: new InMemoryCache(),
});
