import { ApiError } from "openapi-typescript-fetch";
import React from "react";

export const useApiFetch = <T>({
  apiFn,
  lazy = false,
}: {
  apiFn: () => Promise<T>;
  lazy?: boolean;
}) => {
  const [error, setError] = React.useState<ApiError | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<T | undefined>();
  const refetch = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFn();
      setData(result);
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError);
    }
    setLoading(false);
  }, []);
  React.useEffect(() => {
    if (lazy) return;

    refetch();
  }, []);
  return {
    data,
    loading,
    error,
    refetch,
  };
};
