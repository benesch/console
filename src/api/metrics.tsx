import React from "react";
import { useRecoilState } from "recoil";
import { UseGetProps } from "restful-react";

import { currentEnvironment } from "../recoil/environments";
import { useAuth } from "./auth";
import { PrometheusMetrics } from "./backend";

export interface MetricsPathParams {
  period: number;
}

export type UseMetricsRetrieveProps = Omit<
  UseGetProps<PrometheusMetrics, unknown, void, MetricsPathParams>,
  "path"
> &
  MetricsPathParams;

type MetricResult = {
  metric: {
    pod: string;
  };
  values: [string, string][];
};

export type MetricsRetrieveType = {
  data: PrometheusMetrics;
  refetch: () => void;
  error: boolean;
};

const useMetricsRetrieve = ({
  period,
  type,
}: UseMetricsRetrieveProps & {
  type: "memory" | "cpu";
}): MetricsRetrieveType => {
  const { fetchAuthed } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const [results, setResults] = React.useState<PrometheusMetrics>({
    metrics: [],
  });
  const [isErroring, setIsErroring] = React.useState(false);

  async function getData() {
    if (!current) return;
    try {
      const response = await fetchAuthed(
        `${current?.assignment?.environmentControllerUrl}/api/metrics/${type}?period=${period}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const parsedResponse = JSON.parse(await response.text());
      setIsErroring(false);
      setResults({
        metrics:
          parsedResponse?.data?.result?.map((item: MetricResult) => ({
            name: item.metric.pod || "unknown",
            values: item.values,
          })) || [],
      });
    } catch (error) {
      console.warn(error);
      setIsErroring(true);
      setResults({
        metrics: [],
      });
    }
  }

  React.useEffect(() => {
    getData();
  }, [current, type, period]);

  return { data: results, refetch: getData, error: isErroring };
};

/**
 * Retrieve memory line graph as a list of a list of tuples (timestamps / utilization in %))
 * for all clusters.
 */
export const useMetricsMemoryRetrieve = ({
  period,
  ...props
}: UseMetricsRetrieveProps): MetricsRetrieveType => {
  return useMetricsRetrieve({ period, type: "memory", ...props });
};

/**
 * Retrieve cpu line graph as a list of a list of tuples (timestamps / utilization in %))
 * for all clusters.
 */
export const useMetricsCpuRetrieve = ({
  period,
  ...props
}: UseMetricsRetrieveProps): MetricsRetrieveType => {
  return useMetricsRetrieve({ period, type: "cpu", ...props });
};
