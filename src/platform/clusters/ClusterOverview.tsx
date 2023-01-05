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
import { Cluster } from "~/api/materialized";
import colors from "~/theme/colors";

export interface Props {
  cluster?: Cluster;
}

const heightPx = 300;

const ClusterOverview = ({ cluster }: Props) => {
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, _setTimePeriodMinutes] = React.useState(60);
  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { data } = useClusterUtilization(cluster?.id, startTime, endTime);

  return (
    <Flex>
      <UtilizationGraph
        dataKey="cpuPercent"
        data={data}
        startTime={startTime}
        endTime={endTime}
        timePeriodMinutes={timePeriodMinutes}
        lineColor={colors.red[500]}
      />
      <UtilizationGraph
        dataKey="memoryPercent"
        data={data}
        startTime={startTime}
        endTime={endTime}
        timePeriodMinutes={timePeriodMinutes}
        lineColor={colors.purple[500]}
      />
    </Flex>
  );
};

interface UtilizationGraph {
  dataKey: string;
  data: any;
  startTime: Date;
  endTime: Date;
  timePeriodMinutes: number;
  lineColor: string;
}

export const UtilizationGraph = ({
  dataKey,
  data,
  startTime,
  endTime,
  timePeriodMinutes,
  lineColor,
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
        <Line dataKey={dataKey} fill={lineColor} isAnimationActive={false} />
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
