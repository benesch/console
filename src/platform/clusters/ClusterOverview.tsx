import { Box, Flex, Text, useTheme } from "@chakra-ui/react";
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

import {
  ReplicaUtilization,
  useClusterUtilization,
} from "~/api/materialize/websocket";
import { Cluster, Replica } from "~/api/materialized";
import TimePeriodSelect, {
  useTimePeriodMinutes,
} from "~/components/TimePeriodSelect";
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
  const [timePeriodMinutes, setTimePeriodMinutes] = useTimePeriodMinutes();
  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { data } = useClusterUtilization(cluster?.id, startTime, endTime);

  const bucketSizeMs = React.useMemo(() => {
    return (timePeriodMinutes / 15) * 60 * 1000;
  }, [timePeriodMinutes]);

  const buckets = React.useMemo(() => {
    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();
    const result = [];
    let currentBucket = startTimestamp;
    while (currentBucket < endTimestamp) {
      result.push(currentBucket);
      currentBucket += bucketSizeMs;
    }
    return result;
  }, [bucketSizeMs, endTime, startTime]);

  type ReplicaId = number;
  type Timestamp = number;
  type ReplicaMap = Map<ReplicaId, ReplicaUtilization[]>;

  const graphData = React.useMemo(() => {
    const bucketMap = new Map<Timestamp, ReplicaMap>();
    for (const datum of data) {
      const bucket = buckets.find(
        (b) =>
          // greater than the start of the bucket, less than the end
          datum.timestamp >= b && datum.timestamp <= b + bucketSizeMs
      );
      if (!bucket) {
        continue;
      }
      const replicaMap = bucketMap.get(bucket);

      if (replicaMap) {
        const replicaBucket = replicaMap.get(datum.id);
        if (replicaBucket) {
          replicaBucket.push(datum);
        } else {
          replicaMap.set(datum.id, [datum]);
        }
      } else {
        bucketMap.set(bucket, new Map([[datum.id, [datum]]]));
      }
    }
    const result: DataPoint[] = [];
    for (const [bucket, replicaMap] of bucketMap.entries()) {
      const bucketValue: DataPoint = { timestamp: bucket };
      for (const replica of cluster?.replicas ?? []) {
        const utilizations = replicaMap.get(replica.id);
        if (!utilizations) {
          continue;
        }
        let maxCpu = utilizations[0];
        for (const value of utilizations) {
          if (value.cpuPercent > maxCpu.cpuPercent) {
            maxCpu = value;
          }
        }
        let maxMemory = utilizations[0];
        for (const value of utilizations) {
          if (value.memoryPercent > maxMemory.memoryPercent) {
            maxMemory = value;
          }
        }
        bucketValue[cpuPercentName(replica.id)] = maxCpu.cpuPercent;
        bucketValue[memoryPercentName(replica.id)] = maxMemory.memoryPercent;
      }
      result.push(bucketValue);
    }
    return result;
  }, [bucketSizeMs, buckets, cluster?.replicas, data]);

  return (
    <Box>
      <Flex width="100%" justifyContent="space-between">
        <Text>Resource Usage</Text>
        <TimePeriodSelect
          timePeriodMinutes={timePeriodMinutes}
          setTimePeriodMinutes={setTimePeriodMinutes}
        />
      </Flex>
      <Flex>
        {cluster && (
          <>
            <Box width="100%">
              CPU
              <UtilizationGraph
                dataKeyFn={cpuPercentName}
                data={graphData}
                startTime={startTime}
                endTime={endTime}
                timePeriodMinutes={timePeriodMinutes}
                lineColor={colors.red[500]}
                replicas={cluster.replicas}
              />
            </Box>
            <Box width="100%">
              Memory
              <UtilizationGraph
                dataKeyFn={memoryPercentName}
                data={graphData}
                startTime={startTime}
                endTime={endTime}
                timePeriodMinutes={timePeriodMinutes}
                lineColor={colors.purple[500]}
                replicas={cluster.replicas}
              />
            </Box>
          </>
        )}
      </Flex>
    </Box>
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
