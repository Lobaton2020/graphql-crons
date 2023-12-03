"use client";
import { useEffect, useState } from "react";
import { apolloClient } from "@app/graphql";

export interface ExportHook {
  loading: boolean;
  error: boolean | string;
  data: any;
  refetch: Function;
}

export const useGqlQuery = (query: any, variablesIn?: any): ExportHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const client = apolloClient;
  const fetchData = (variables?: any) => {
    setLoading(true);
    client
      .query({ query, variables, fetchPolicy: "network-only" })
      .then(({ data: dataIn }) => {
        setData(dataIn);
      })
      .catch((error) => {
        console.error(`${useGqlQuery.name}::CustomHook`, error);
        setError(error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(variablesIn);
  }, []);

  const refetch = (newVariables?: any) => {
    fetchData(newVariables || variablesIn);
  };

  return {
    loading,
    error,
    data,
    refetch,
  };
};
