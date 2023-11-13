import { ApolloClient, InMemoryCache } from "@apollo/client";

export default function createApolloClient() {
  return new ApolloClient({
    uri: process.env.GRAPHQL_API,
    cache: new InMemoryCache(),
  });
}
