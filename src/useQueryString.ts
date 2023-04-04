import React from "react";
import { useNavigate } from "react-router-dom";

export const useQueryStringState = (queryStringKey: string) => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState<string | undefined>();

  const setSelectedValue = React.useCallback(
    (val: string | undefined) => {
      const url = new URL(window.location.toString());
      setValue(val);
      if (!val) {
        url.searchParams.delete(queryStringKey);
      } else {
        url.searchParams.set(queryStringKey, val);
      }
      navigate(url.pathname + url.search + url.hash, { replace: true });
    },
    [navigate, queryStringKey]
  );

  React.useEffect(() => {
    const url = new URL(window.location.toString());
    const val = url.searchParams.get(queryStringKey);
    if (val) {
      setSelectedValue(val);
    }
  }, [queryStringKey, setSelectedValue]);

  return [value, setSelectedValue] as const;
};
