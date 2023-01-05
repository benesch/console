import { Flex, useTheme } from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  subMinutes,
} from "date-fns";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useClusterUtilization } from "~/api/materialize/websocket";
import { Cluster, Replica } from "~/api/materialized";
import colors from "~/theme/colors";

export interface Props {
  cluster?: Cluster;
}

export interface DataPoint {
  timestamp: number;
  [replicaKey: string]: number;
}

const heightPx = 300;
const cpuPercentName = (id: number) => `replica${id}CpuPercent`;
const memoryPercentName = (id: number) => `replica${id}MemoryPercent`;

const ClusterOverview = ({ cluster }: Props) => {
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, _setTimePeriodMinutes] = React.useState(60);
  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { data } = useClusterUtilization(cluster?.id, startTime, endTime);

  const timestampMap = new Map<number, DataPoint[]>();
  for (const datum of data) {
    const dataForTimestamp = timestampMap.get(datum.timestamp);
    const dataPoint = {
      timestamp: datum.timestamp,
      [cpuPercentName(datum.id)]: datum.cpuPercent,
      [memoryPercentName(datum.id)]: datum.memoryPercent,
    };
    if (dataForTimestamp) {
      dataForTimestamp.push(dataPoint);
    } else {
      timestampMap.set(datum.timestamp, [dataPoint]);
    }
  }
  const graphData = Array.from(timestampMap.values()).flat();

  return (
    <Flex height={heightPx}>
      {cluster && (
        <>
          <UtilizationGraph
            dataKeyFn={cpuPercentName}
            data={graphData}
            startTime={startTime}
            endTime={endTime}
            timePeriodMinutes={timePeriodMinutes}
            lineColor={colors.red[500]}
            replicas={cluster.replicas}
          />
          <UtilizationGraph
            dataKeyFn={memoryPercentName}
            data={graphData}
            startTime={startTime}
            endTime={endTime}
            timePeriodMinutes={timePeriodMinutes}
            lineColor={colors.purple[500]}
            replicas={cluster.replicas}
          />
        </>
      )}
    </Flex>
  );
};

interface UtilizationGraph {
  data: any;
  dataKeyFn: (id: number) => string;
  endTime: Date;
  lineColor: string;
  replicas: Replica[];
  startTime: Date;
  timePeriodMinutes: number;
}

const lineColors = [colors.red[500], colors.purple[500], colors.blue[500]];

export const UtilizationGraph = ({
  data,
  dataKeyFn,
  endTime,
  replicas,
  startTime,
  timePeriodMinutes,
}: UtilizationGraph) => {
  const {
    colors: { semanticColors },
    fonts,
  } = useTheme();

  return (
    <ResponsiveContainer width="100%" height={heightPx}>
      <LineChart data={data} barSize={4}>
        <CartesianGrid
          vertical={false}
          stroke={semanticColors.border.primary}
          strokeDasharray="4"
        />
        <XAxis
          domain={[startTime.getTime(), endTime.getTime()]}
          type="number"
          axisLine={false}
          tickLine={false}
          interval={0}
          dataKey="timestamp"
          style={{
            fontSize: "12px",
            fontFamily: fonts.mono,
          }}
          tickFormatter={(value) => {
            if (timePeriodMinutes < 6 * 60) {
              return `${differenceInMinutes(
                endTime,
                new Date(value)
              ).toString()}m`;
            }
            if (timePeriodMinutes < 30 * 24 * 60) {
              return `${differenceInHours(
                endTime,
                new Date(value)
              ).toString()}h`;
            }
            return `${differenceInDays(endTime, new Date(value)).toString()}d`;
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          style={{
            fontSize: "12px",
            fontFamily: fonts.mono,
          }}
        />
        <Tooltip
          contentStyle={{
            background: semanticColors.background.inverse,
            border: 0,
            borderRadius: "8px",
            fontSize: "14px",
            lineHeight: "16px",
            padding: "4px 8px",
          }}
          wrapperStyle={{
            outline: "none",
          }}
          itemStyle={{
            color: semanticColors.foreground.inverse,
          }}
          labelFormatter={() => ""}
          cursor={false}
        />
        {replicas.map((r, i) => {
          return (
            <Line
              key={r.id}
              dataKey={dataKeyFn(r.id)}
              fill={lineColors[i]}
              isAnimationActive={false}
            />
          );
        })}
        {data?.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle">
            No data
          </text>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ClusterOverview;
