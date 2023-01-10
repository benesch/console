import {
  Box,
  chakra,
  Flex,
  HStack,
  Spinner,
  Text,
  useTheme,
} from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  subMinutes,
} from "date-fns";
import React from "react";
import {
  CartesianGrid,
  Legend,
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
import { Cluster } from "~/api/materialized";
import FullPageError from "~/components/FullPageError";
import LabeledSelect from "~/components/LabeledSelect";
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
const lineColors = [
  colors.cobalt[700],
  colors.turquoise[600],
  colors.blue[700],
  colors.yellow[700],
  colors.green[500],
];

const ClusterOverview = ({ cluster }: Props) => {
  const {
    colors: { semanticColors },
  } = useTheme();
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, setTimePeriodMinutes] = useTimePeriodMinutes();
  const [selectedReplica, setSelectedReplica] = React.useState("all");
  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { data, errors } = useClusterUtilization(
    cluster?.id,
    startTime,
    endTime,
    selectedReplica === "all" ? undefined : parseInt(selectedReplica)
  );

  const selectedReplicaIds = React.useMemo(
    () =>
      selectedReplica === "all"
        ? cluster?.replicas.map((r) => r.id)
        : [parseInt(selectedReplica)],
    [cluster?.replicas, selectedReplica]
  );
  const replicaColorMap = React.useMemo(() => {
    return new Map(
      cluster?.replicas.map((r, i) => [
        r.id,
        { name: r.replica, color: lineColors[i] },
      ])
    );
  }, [cluster?.replicas]);

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
    if (!data) return undefined;

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
      for (const replicaId of selectedReplicaIds ?? []) {
        const utilizations = replicaMap.get(replicaId);
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
        bucketValue[cpuPercentName(replicaId)] = maxCpu.cpuPercent;
        bucketValue[memoryPercentName(replicaId)] = maxMemory.memoryPercent;
      }
      result.push(bucketValue);
    }
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }, [bucketSizeMs, buckets, data, selectedReplicaIds]);

  if (errors.length === 1 && errors[0] === "Region unavailable") {
    return <FullPageError message="This region is currently unavailable" />;
  }
  if (errors.length > 0) {
    return <FullPageError />;
  }
  return (
    <Box
      border={`solid 1px ${semanticColors.border.primary}`}
      borderRadius="8px"
      py={4}
      px={6}
      width="100%"
    >
      <Flex width="100%" justifyContent="space-between" mb="4">
        <Text fontSize="md">Resource Usage</Text>
        <HStack>
          {cluster && (
            <LabeledSelect
              label="replicas"
              value={selectedReplica}
              onChange={(e) => setSelectedReplica(e.target.value)}
            >
              <option value="all">All</option>
              {cluster.replicas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.replica}
                </option>
              ))}
            </LabeledSelect>
          )}
          <TimePeriodSelect
            timePeriodMinutes={timePeriodMinutes}
            setTimePeriodMinutes={setTimePeriodMinutes}
          />
        </HStack>
      </Flex>
      <HStack spacing={6}>
        <Box width="100%">
          <Text fontSize="xs">CPU</Text>
          <UtilizationGraph
            dataKeyFn={cpuPercentName}
            data={graphData}
            startTime={startTime}
            endTime={endTime}
            timePeriodMinutes={timePeriodMinutes}
            replicaColorMap={replicaColorMap}
            replicaIds={selectedReplicaIds}
            bucketSizeMs={bucketSizeMs}
          />
        </Box>
        <Box width="100%">
          <Text fontSize="xs">Memory</Text>
          <UtilizationGraph
            dataKeyFn={memoryPercentName}
            data={graphData}
            startTime={startTime}
            endTime={endTime}
            timePeriodMinutes={timePeriodMinutes}
            replicaColorMap={replicaColorMap}
            replicaIds={selectedReplicaIds}
            bucketSizeMs={bucketSizeMs}
          />
        </Box>
      </HStack>
    </Box>
  );
};

interface UtilizationGraph {
  data?: DataPoint[];
  dataKeyFn: (id: number) => string;
  endTime: Date;
  replicaColorMap: Map<number, { name: string; color: string }>;
  replicaIds?: number[];
  startTime: Date;
  timePeriodMinutes: number;
  bucketSizeMs: number;
}

export const UtilizationGraph = ({
  bucketSizeMs,
  data,
  dataKeyFn,
  endTime,
  replicaColorMap,
  replicaIds,
  startTime,
  timePeriodMinutes,
}: UtilizationGraph) => {
  const {
    colors: { semanticColors },
    fonts,
  } = useTheme();
  const startTimeMs = startTime.getTime();
  const duration = endTime.getTime() - startTimeMs;
  const tickSlots = Array.from({
    length: Math.round(duration / bucketSizeMs / 2),
  }) as undefined[];
  const ticks = tickSlots.map((_, i) => i * bucketSizeMs * 2 + startTimeMs);
  const legendData = React.useMemo(
    () => Array.from(replicaColorMap.entries()),
    [replicaColorMap]
  );

  if (!replicaIds || !data) {
    return (
      <Flex height={heightPx} alignItems="center" justifyContent="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={heightPx}>
      <LineChart
        data={data}
        barSize={4}
        margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
      >
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
          ticks={ticks}
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
        {replicaIds.map((id) => {
          return (
            <Line
              key={id}
              dataKey={dataKeyFn(id)}
              stroke={replicaColorMap.get(id)?.color}
              isAnimationActive={false}
              dot={false}
            />
          );
        })}
        <Legend
          verticalAlign="bottom"
          height={36}
          content={() => (
            <HStack spacing={4} as="ul" ml={16}>
              {legendData.map(([replicaId, { name, color }]) => (
                <HStack as="li" alignItems="center" key={replicaId}>
                  <chakra.div
                    backgroundColor={color}
                    height="8px"
                    width="8px"
                    borderRadius="8px"
                  ></chakra.div>
                  <div>{name}</div>
                </HStack>
              ))}
            </HStack>
          )}
        />
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
