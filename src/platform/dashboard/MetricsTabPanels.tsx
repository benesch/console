import { Spinner, useInterval } from "@chakra-ui/react";
import { TabPanel, TabPanelProps } from "@chakra-ui/tabs";
import React from "react";

import {
  MetricsRetrieveType,
  useMetricsCpuRetrieve,
  useMetricsMemoryRetrieve,
} from "../../api/metrics";
import { defaultMetricPeriod } from "../../components/metrics/components/MetricPeriodSelector";
import MetricsLineChart from "../../components/metrics/components/MetricsLineChart";
import {
  inferDomainFromValues,
  inferTicksFromDomain,
} from "../../components/metrics/domains";
import { prometheusMetricsToVictoryMetrics } from "../../components/metrics/transformers";

type MetricsProps = {
  period: number;
  setPeriod: (period: number) => void;
};

type MetricsTabPanelProps = MetricsProps &
  TabPanelProps &
  MetricsRetrieveType & {
    errorMessage: string;
  };

const MetricsTabPanel = ({
  data,
  refetch,
  errorMessage,
  period,
  setPeriod,
  ...props
}: MetricsTabPanelProps) => {
  const chartData = React.useMemo(() => {
    const victoryCompatibleMetrics = prometheusMetricsToVictoryMetrics(data);
    const domains = inferDomainFromValues(victoryCompatibleMetrics);
    return {
      chart: {
        data: victoryCompatibleMetrics,
        domains,
        ticks: inferTicksFromDomain(domains),
      },
      filters: {
        period,
        setPeriod,
      },
    };
  }, [data, period]);
  const isLoading = chartData.chart === null;
  return (
    <TabPanel {...props}>
      {isLoading ? (
        <Spinner my={6} />
      ) : (
        <MetricsLineChart
          {...chartData}
          filters={{ period, setPeriod }}
          testId="fetch-deployment-metric-error"
          errorMessage={errorMessage}
          useLines
        />
      )}
    </TabPanel>
  );
};

export const MemoryMetricsTabPanel: React.FC<MetricsProps> = (
  props: MetricsProps
) => {
  const [period, setPeriod] = React.useState<number>(defaultMetricPeriod);
  const hook = useMetricsMemoryRetrieve({
    period,
  });

  useInterval(() => {
    hook.refetch();
  }, 30000);

  return (
    <MetricsTabPanel
      {...props}
      {...hook}
      period={period}
      setPeriod={setPeriod}
      errorMessage={hook.error ? "Failed to load cluster memory metrics" : ""}
    />
  );
};

export const CpuMetricsTabPanel: React.FC<MetricsProps> = (
  props: MetricsProps
) => {
  const [period, setPeriod] = React.useState<number>(defaultMetricPeriod);
  const hook = useMetricsCpuRetrieve({
    period,
  });

  useInterval(() => {
    hook.refetch();
  }, 30000);
  return (
    <MetricsTabPanel
      {...props}
      {...hook}
      period={period}
      setPeriod={setPeriod}
      errorMessage={hook.error ? "Failed to load cluster CPU metrics" : ""}
    />
  );
};
