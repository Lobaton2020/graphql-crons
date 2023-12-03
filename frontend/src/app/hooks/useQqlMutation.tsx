"use client";
import { useState } from "react";
import { apolloClient } from "@app/graphql";
import { toast } from "react-toastify";

export interface ExportHookMutate {
  loading: boolean;
  error: boolean | string;
  data: any;
}

export interface IOptions {
  onDone?: Function;
  onSuccess?: Function;
  onError?: Function;
  onStart?: Function;
}
export const useQqlMutation = (
  query: any,
  options: IOptions = {}
): [any, ExportHookMutate] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const client = apolloClient;
  if (!options.onError) {
    options.onError = (error) => toast.error(`${error.message}`);
  }
  const mutate = (variables: any) => {
    options?.onStart && options?.onStart();
    setLoading(true);
    client
      .mutate({ mutation: query, variables })
      .then(({ data: dataIn }) => {
        setData(dataIn);
        options?.onSuccess && options?.onSuccess(dataIn);
      })
      .catch((error) => {
        setError(error);
        console.error(`${useQqlMutation.name}::CustomHook`, error);
        options?.onError && options?.onError(error);
      })
      .finally(() => {
        setLoading(false);
        options?.onDone && options?.onDone();
      });
  };

  return [
    mutate,
    {
      loading,
      error,
      data,
    },
  ];
};
