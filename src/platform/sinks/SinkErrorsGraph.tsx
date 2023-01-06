import { Box, Flex, Spinner, Text, useTheme } from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
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

import { TimestampedCounts, useBucketedSinkErrors } from "~/api/materialized";
import colors from "~/theme/colors";

export interface Props {
  sinkId?: string;
  timePeriodMinutes: number;
}

const heightPx = 300;

const SinkErrorsGraph = ({ sinkId, timePeriodMinutes }: Props) => {
  const {
    colors: { semanticColors },
    fonts,
  } = useTheme();
  const endTime = React.useMemo(() => new Date(), []);
  const startTime = React.useMemo(
    () => subMinutes(endTime, timePeriodMinutes),
    [timePeriodMinutes, endTime]
  );
  const bucketSizeSeconds = React.useMemo(() => {
    return (timePeriodMinutes / 15) * 60;
  }, [timePeriodMinutes]);
  const { loading, data: statuses } = useBucketedSinkErrors({
    sinkId: sinkId,
    startTime,
    endTime,
    bucketSizeSeconds,
  });

  if (!sinkId || loading || !statuses) {
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
    length: Math.round(duration / bucketSizeMs / 2),
  }) as undefined[];
  const ticks = tickSlots.map((_, i) => i * bucketSizeMs * 2 + startTimeMs);

  return (
    <ResponsiveContainer width="100%" height={heightPx}>
      <BarChart data={statuses} barSize={4}>
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
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;

            const bucket = payload[0].payload as TimestampedCounts;
            const barStart = new Date(bucket.timestamp);
            const barEnd = new Date(bucket.timestamp + bucketSizeMs);
            const startLabel = `${format(barStart, "MM-dd-yy")} ${format(
              barStart,
              "HH:mm"
            )} UTC`;
            const endLabel = `${format(barEnd, "MM-dd-yy")} ${format(
              barEnd,
              "HH:mm"
            )} UTC`;
            return (
              <Box
                background={colors.gray[700]}
                border="0"
                borderRadius="lg"
                px="8px"
                py="4px"
              >
                <Text
                  fontSize="14"
                  color={colors.gray[50]}
                >{`${bucket.count} errors`}</Text>
                <Text
                  fontSize="12"
                  color={colors.gray[400]}
                >{`${startLabel} - ${endLabel}`}</Text>
              </Box>
            );
          }}
          labelFormatter={() => ""}
          cursor={false}
        />
        <Bar dataKey="count" fill={colors.red[500]} isAnimationActive={false} />
        {statuses?.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle">
            No data
          </text>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SinkErrorsGraph;
