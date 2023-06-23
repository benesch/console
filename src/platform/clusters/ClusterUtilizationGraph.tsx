import { chakra, Flex, HStack, Text, useTheme, VStack } from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import React from "react";
import {
  CartesianGrid,
  DotProps,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Replica } from "~/api/materialize/useClusters";
import { NotReadyReason } from "~/api/materialize/useClusterUtilization";
import { MaterializeTheme } from "~/theme";
import { formatTimeInUtc } from "~/util";

import { ReplicaData } from "./ClusterOverview";

// number of ticks we show on the graph
const tickCount = 8;
export const graphHeightPx = 300;

export interface DataPoint {
  id: string;
  name: string;
  size: string;
  timestamp: number;
  cpuPercent: number;
  memoryPercent: number;
  notReadyReason: NotReadyReason | null;
  [key: string]: string | number | null;
}

interface UtilizationGraph {
  data: ReplicaData[];
  dataKey: string;
  endTime: Date;
  replicaColorMap: Map<string, { name: string; color: string }>;
  replicas: Replica[];
  startTime: Date;
  timePeriodMinutes: number;
  showNotReady?: boolean;
}

export const ClusterUtilizationGraph = ({
  data,
  dataKey,
  endTime,
  replicaColorMap,
  replicas,
  showNotReady,
  startTime,
  timePeriodMinutes,
}: UtilizationGraph) => {
  const { colors, fonts } = useTheme<MaterializeTheme>();
  const startTimeMs = startTime.getTime();
  const duration = endTime.getTime() - startTimeMs;
  const tickSlots = Array.from({
    length: tickCount,
  }) as undefined[];
  const ticks = tickSlots.map(
    (_, i) => i * (duration / tickCount) + startTimeMs
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
          stroke={colors.border.primary}
          strokeDasharray="4"
        />
        <XAxis
          allowDuplicatedCategory={false}
          domain={[startTime.getTime(), endTime.getTime()]}
          type="number"
          axisLine={{ stroke: colors.border.secondary, strokeWidth: 2 }}
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
                align="start"
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
                    <Flex
                      key={i}
                      justifyContent="space-between"
                      width="fit-content"
                      gap={4}
                    >
                      <div>
                        {datapoint.name}
                        <Text as="span" color={colors.gray[400]}>
                          {` (${datapoint.size})`}
                        </Text>
                      </div>
                      {datapoint.notReadyReason === "oom-killed" ? (
                        <Text>Out of Memory</Text>
                      ) : (
                        <div>{`${(datapoint[key] as number).toFixed(1)}%`}</div>
                      )}
                    </Flex>
                  );
                })}
                <Text color={colors.gray[400]}>{`${formatTimeInUtc(
                  timestamp
                )} UTC`}</Text>
              </VStack>
            );
          }}
        />
        {data.map((replicaData) => {
          const replica = replicas.find((r) => r.id === replicaData.id);
          if (!replica) return;
          return (
            <>
              <Line
                name={replica.name}
                key={replica.id}
                dataKey={dataKey}
                stroke={replicaColorMap.get(replica.id)?.color}
                data={replicaData.data}
                isAnimationActive={false}
                dot={
                  showNotReady ? <ClusterEventDot key={Math.random()} /> : false
                }
              />
            </>
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
            fill={colors.foreground.primary}
          >
            No data
          </text>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

const ClusterEventDot = (props: DotProps) => {
  const { cx, cy, payload } = props as DotProps & { payload: DataPoint };

  // If we return null here, recharts won't try to render any more dots after the first null is returned
  if (!cx || !cy || !payload.notReadyReason) return <></>;

  return (
    <svg
      x={cx - 6}
      y={cy - 6}
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        fill="white"
        stroke="#000082"
        strokeWidth="2"
      />
    </svg>
  );
};

export default ClusterUtilizationGraph;
