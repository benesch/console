import { chakra, Flex, HStack, Text, useTheme, VStack } from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
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
import { MaterializeTheme } from "~/theme";
import colors from "~/theme/colors";

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
  notReadyReason: string | null;
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
  const {
    colors: { semanticColors },
    fonts,
  } = useTheme<MaterializeTheme>();
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
                      {datapoint.notReadyReason === "oom-killed" ? (
                        <Text>OOM</Text>
                      ) : (
                        <div>{`${(datapoint[key] as number).toFixed(1)}%`}</div>
                      )}
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
            fill={semanticColors.foreground.primary}
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
      x={cx - 10}
      y={cy - 10}
      width={20}
      height={20}
      fill="red"
      viewBox="0 0 1024 1024"
    >
      <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z" />
    </svg>
  );
};

export default ClusterUtilizationGraph;
