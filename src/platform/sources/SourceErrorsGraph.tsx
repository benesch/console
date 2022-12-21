import { Flex, Spinner, useTheme } from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  subMinutes,
} from "date-fns";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useBucketedSourceErrors } from "~/api/materialized";

export interface Props {
  sourceId?: string;
  timePeriodMinutes: number;
}

const heightPx = 300;

const SourceErrorsGraph = ({ sourceId, timePeriodMinutes }: Props) => {
  const { colors, fonts } = useTheme();
  const endTime = React.useMemo(() => new Date(), []);
  const startTime = React.useMemo(
    () => subMinutes(endTime, timePeriodMinutes),
    [timePeriodMinutes, endTime]
  );
  const bucketSizeSeconds = React.useMemo(() => {
    return (timePeriodMinutes / 15) * 60;
  }, [timePeriodMinutes]);
  const { loading, data: statuses } = useBucketedSourceErrors({
    sourceId: sourceId,
    startTime,
    endTime,
    bucketSizeSeconds,
  });

  if (!sourceId || loading || !statuses) {
    return (
      <Flex height={heightPx} alignItems="center" justifyContent="center">
        <Spinner />
      </Flex>
    );
  }

  // Show an X axis tick on every other possible bar, even if there are no errors
  const startTimeMs = startTime.getTime();
  const bucketSizeMs = bucketSizeSeconds * 1000;
  const duration = endTime.getTime() - startTimeMs;
  const tickSlots = Array.from({
    length: duration / bucketSizeMs / 2,
  }) as undefined[];
  const ticks = tickSlots.map((_, i) => i * bucketSizeMs * 2 + startTimeMs);

  return (
    <ResponsiveContainer width="100%" height={heightPx}>
      <BarChart data={statuses} barSize={4}>
        <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="4" />
        <XAxis
          domain={[startTime.getTime(), endTime.getTime()]}
          type="number"
          axisLine={false}
          tickLine={false}
          ticks={ticks}
          interval={0}
          dataKey="timestamp"
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
          style={{
            fontSize: "12px",
            fontFamily: fonts.mono,
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
          formatter={(value) => {
            return [`${value} errors`];
          }}
          contentStyle={{
            background: colors.semanticColors.background.inverse,
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
            color: colors.semanticColors.foreground.inverse,
          }}
          labelFormatter={() => ""}
          cursor={false}
        />
        <Bar dataKey="count" fill={colors.red[500]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SourceErrorsGraph;
