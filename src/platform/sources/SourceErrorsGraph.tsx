import { Box, Flex, Spinner, Text, useTheme } from "@chakra-ui/react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  subMinutes,
} from "date-fns";
import React from "react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useBucketedSourceErrors from "~/api/materialize/useBucketedSourceErrors";
import { TimestampedCounts } from "~/api/materialized";
import ErrorBox from "~/components/ErrorBox";
import { MaterializeTheme } from "~/theme";
import colors from "~/theme/colors";
import { formatTimeInUtc } from "~/util";

import { SchemaObjectRouteParams } from "../schemaObjectRouteHelpers";
import { SOURCES_FETCH_ERROR_MESSAGE } from "./constants";

export interface Props {
  timePeriodMinutes: number;
}

const heightPx = 300;

const SourceErrorsGraph = ({ timePeriodMinutes }: Props) => {
  const { colors: themeColors, fonts } = useTheme<MaterializeTheme>();
  const { id: sourceId } = useParams<SchemaObjectRouteParams>();
  const endTime = React.useMemo(() => new Date(), []);
  const startTime = React.useMemo(
    () => subMinutes(endTime, timePeriodMinutes),
    [timePeriodMinutes, endTime]
  );
  const bucketSizeSeconds = React.useMemo(() => {
    return (timePeriodMinutes / 15) * 60;
  }, [timePeriodMinutes]);
  const {
    isInitiallyLoading,
    data: statuses,
    isError,
  } = useBucketedSourceErrors({
    sourceId: sourceId,
    startTime,
    endTime,
    bucketSizeSeconds,
  });

  if (isError) {
    return (
      <Flex height={heightPx} alignItems="center" justifyContent="center">
        <ErrorBox message={SOURCES_FETCH_ERROR_MESSAGE} />
      </Flex>
    );
  }

  if (isInitiallyLoading) {
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
      <BarChart data={statuses ?? []} barSize={4}>
        <CartesianGrid
          vertical={false}
          horizontal={statuses !== null && statuses.length > 0}
          stroke={themeColors.border.secondary}
          strokeDasharray="4"
        />
        <XAxis
          domain={[startTime.getTime(), endTime.getTime()]}
          type="number"
          axisLine={{ stroke: themeColors.border.secondary, strokeWidth: 2 }}
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
            background: themeColors.background.inverse,
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
            color: themeColors.foreground.inverse,
          }}
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;

            const bucket = payload[0].payload as TimestampedCounts;
            const barStart = new Date(bucket.timestamp);
            const barEnd = new Date(bucket.timestamp + bucketSizeMs);
            const startLabel = `${formatTimeInUtc(
              barStart,
              "MM-dd-yy HH:mm"
            )} UTC`;
            const endLabel = `${formatTimeInUtc(barEnd, "MM-dd-yy HH:mm")} UTC`;
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
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill={themeColors.foreground.primary}
          >
            No errors during this time period.
          </text>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SourceErrorsGraph;
