import {
  Box,
  chakra,
  Flex,
  HStack,
  Spinner,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  subMinutes,
} from "date-fns";
import { useFlags } from "launchdarkly-react-client-sdk";
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
import { Cluster, Replica } from "~/api/materialized";
import ErrorBox from "~/components/ErrorBox";
import LabeledSelect from "~/components/LabeledSelect";
import TimePeriodSelect, {
  useTimePeriodMinutes,
} from "~/components/TimePeriodSelect";
import { MaterializeTheme } from "~/theme";
import colors from "~/theme/colors";

export interface Props {
  cluster?: Cluster;
}

export interface ReplicaData {
  id: number;
  data: DataPoint[];
}

export interface DataPoint {
  id: number;
  name: string;
  size: string;
  timestamp: number;
  cpuPercent: number;
  memoryPercent: number;
  [key: string]: string | number;
}

const graphHeightPx = 300;
const labelHeightPx = 18;

const ClusterOverview = ({ cluster }: Props) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const flags = useFlags();
  const [timePeriodMinutes, setTimePeriodMinutes] = useTimePeriodMinutes();
  const [endTime, setEndTime] = React.useState(new Date());
  const [selectedReplica, setSelectedReplica] = React.useState("all");
  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);
  React.useEffect(() => setEndTime(new Date()), [timePeriodMinutes]);

  const { data, errors, isStale } = useClusterUtilization(
    cluster?.id,
    startTime,
    endTime,
    selectedReplica === "all" ? undefined : parseInt(selectedReplica)
  );

  const selectedReplicas = React.useMemo(() => {
    if (!cluster) return [];

    if (selectedReplica === "all") {
      return cluster.replicas;
    }
    const replica = cluster.replicas.find(
      (r) => r.id === parseInt(selectedReplica)
    );
    if (!replica) {
      return cluster.replicas;
    }
    return [replica];
  }, [cluster, selectedReplica]);
  const replicaColorMap = React.useMemo(() => {
    return new Map(
      cluster?.replicas.map((r, i) => [
        r.id,
        { name: r.name, color: semanticColors.lineGraph[i] },
      ])
    );
  }, [cluster?.replicas, semanticColors.lineGraph]);

  const bucketSizeMs = React.useMemo(() => {
    return timePeriodMinutes * 1000;
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
    if (!cluster || !data) return undefined;

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
    const chartData: ReplicaData[] = [];
    for (const replica of selectedReplicas ?? []) {
      const lineData: DataPoint[] = [];
      for (const [bucket, replicaMap] of bucketMap.entries()) {
        if (!replica) continue;
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
        const bucketValue: DataPoint = {
          id: replica.id,
          name: replica.name,
          size: replica.size,
          timestamp: bucket,
          cpuPercent: maxCpu.cpuPercent,
          memoryPercent: maxMemory.memoryPercent,
        };
        lineData.push(bucketValue);
      }
      chartData.push({
        id: replica.id,
        data: lineData.sort((a, b) => a.timestamp - b.timestamp),
      });
    }
    return chartData;
  }, [bucketSizeMs, buckets, cluster, data, selectedReplicas]);

  if (errors.length > 0) {
    return <ErrorBox message="An error occurred loading cluster data" />;
  }
  const loading = !cluster?.replicas || !graphData || isStale;
  return (
    <Box
      border={`solid 1px ${semanticColors.border.primary}`}
      borderRadius="8px"
      py={4}
      px={6}
      width="100%"
      minW="460px"
    >
      <Flex
        width="100%"
        alignItems="start"
        justifyContent="space-between"
        mb="6"
      >
        <VStack alignItems="start" gap={0}>
          <Text as="h3" fontSize="18px" lineHeight="20px" fontWeight={500}>
            Resource Usage
          </Text>
          <Text fontSize="sm" lineHeight="20px" maxW="60ch">
            Resource usage metrics are an approximations, calculated as a
            percentage of each replica&apos;s total resource allocation.
          </Text>
        </VStack>
        <HStack>
          {cluster && (
            <LabeledSelect
              label="Replicas"
              value={selectedReplica}
              onChange={(e) => setSelectedReplica(e.target.value)}
            >
              <option value="all">All</option>
              {cluster.replicas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
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
        {loading ? (
          <Flex
            height={graphHeightPx + labelHeightPx}
            width="100%"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner />
          </Flex>
        ) : (
          <>
            {flags["cluster-cpu-utilization-5188"] && (
              <Box width="100%">
                <Text fontSize="sm" lineHeight="16px" mb={2} fontWeight={500}>
                  CPU
                </Text>
                <UtilizationGraph
                  dataKey="cpuPercent"
                  data={graphData}
                  startTime={startTime}
                  endTime={endTime}
                  timePeriodMinutes={timePeriodMinutes}
                  replicaColorMap={replicaColorMap}
                  replicas={selectedReplicas}
                  bucketSizeMs={bucketSizeMs}
                />
              </Box>
            )}
            <Box width="100%">
              <Text fontSize="sm" lineHeight="16px" mb={2} fontWeight={500}>
                Memory
              </Text>
              <UtilizationGraph
                dataKey="memoryPercent"
                data={graphData}
                startTime={startTime}
                endTime={endTime}
                timePeriodMinutes={timePeriodMinutes}
                replicaColorMap={replicaColorMap}
                replicas={selectedReplicas}
                bucketSizeMs={bucketSizeMs}
              />
            </Box>
          </>
        )}
      </HStack>
    </Box>
  );
};

const ticketSizeDivisor = 8;

interface UtilizationGraph {
  data: ReplicaData[];
  dataKey: string;
  endTime: Date;
  replicaColorMap: Map<number, { name: string; color: string }>;
  replicas: Replica[];
  startTime: Date;
  timePeriodMinutes: number;
  bucketSizeMs: number;
}

export const UtilizationGraph = ({
  bucketSizeMs,
  data,
  dataKey,
  endTime,
  replicaColorMap,
  replicas,
  startTime,
  timePeriodMinutes,
}: UtilizationGraph) => {
  const {
    colors: { semanticColors },
    fonts,
  } = useTheme<MaterializeTheme>();
  const startTimeMs = startTime.getTime();
  const duration = endTime.getTime() - startTimeMs;
  const tickSlots = Array.from({
    length: Math.round(duration / bucketSizeMs / ticketSizeDivisor),
  }) as undefined[];
  const ticks = tickSlots.map(
    (_, i) => i * bucketSizeMs * ticketSizeDivisor + startTimeMs
  );
  const legendData = React.useMemo(
    () => Array.from(replicaColorMap.entries()),
    [replicaColorMap]
  );

  // ResponsiveContainer in a flex container doesn't work correctly with width 100%, but does at 99%
  // https://github.com/recharts/recharts/issues/1423#issuecomment-411098968
  return (
    <ResponsiveContainer width="99%" height={graphHeightPx}>
      <LineChart
        syncId="clusterUtilization"
        barSize={4}
        margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
      >
        <CartesianGrid
          vertical={false}
          horizontal={data.length > 0}
          stroke={semanticColors.border.primary}
          strokeDasharray="4"
        />
        <XAxis
          allowDuplicatedCategory={false}
          domain={[startTime.getTime(), endTime.getTime()]}
          type="number"
          axisLine={{ stroke: semanticColors.border.secondary, strokeWidth: 2 }}
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
          tickFormatter={(value) => {
            return `${value}%`;
          }}
          width={36}
        />
        <Tooltip
          animationDuration={200}
          wrapperStyle={{
            outline: "none",
          }}
          cursor={data.length > 0}
          content={({ active, payload, label: timestamp }) => {
            if (!active || !payload || payload.length === 0) return null;
            return (
              <VStack
                spacing={2}
                background={colors.gray[700]}
                color={colors.gray[50]}
                border={0}
                borderRadius="md"
                lineHeight="16px"
                fontSize="sm"
                paddingY="2"
                paddingX="4"
              >
                {payload.map((item, i) => {
                  const datapoint = item.payload as DataPoint;
                  const key = item.dataKey as string;
                  return (
                    <Flex key={i} justifyContent="space-between" width="160px">
                      <div>
                        {datapoint.name}
                        <Text as="span" color={colors.gray[400]}>
                          {` (${datapoint.size})`}
                        </Text>
                      </div>
                      <div>{`${(datapoint[key] as number).toFixed(1)}%`}</div>
                    </Flex>
                  );
                })}
                <Text color={colors.gray[400]}>{`${format(
                  timestamp,
                  "HH:mm:ss"
                )} UTC`}</Text>
              </VStack>
            );
          }}
        />
        {data.map((replicaData) => {
          const replica = replicas.find((r) => r.id === replicaData.id);
          if (!replica) return;
          return (
            <Line
              name={replica.name}
              key={replica.id}
              dataKey={dataKey}
              stroke={replicaColorMap.get(replica.id)?.color}
              data={replicaData.data}
              isAnimationActive={false}
              dot={false}
            />
          );
        })}
        <Legend
          verticalAlign="bottom"
          height={36}
          content={() => (
            <HStack spacing={4} as="ul" ml={8}>
              {legendData.map(([replicaId, { name, color }]) => (
                <HStack as="li" alignItems="center" key={replicaId}>
                  <chakra.div
                    backgroundColor={color}
                    height="8px"
                    width="8px"
                    borderRadius="8px"
                  ></chakra.div>
                  <Text fontSize="xs">{name}</Text>
                </HStack>
              ))}
            </HStack>
          )}
        />
        {data?.length === 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill={semanticColors.foreground.primary}
          >
            No data
          </text>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ClusterOverview;
