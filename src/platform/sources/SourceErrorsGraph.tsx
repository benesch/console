import { Spinner, useTheme } from "@chakra-ui/react";
import { differenceInHours, subMinutes } from "date-fns";
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

import { useSourceStatuses } from "~/api/materialized";

export interface Props {
  sourceId?: string;
  timePeriodMinutes: number;
}

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
  const { loading, data: statuses } = useSourceStatuses({
    sourceId: sourceId,
    startTime,
    endTime,
    bucketSizeSeconds,
  });

  if (!sourceId || loading || !statuses) {
    return <Spinner />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={statuses} barSize={4}>
        <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="4" />
        <XAxis
          domain={[startTime.getTime(), endTime.getTime()]}
          type="number"
          axisLine={false}
          tickLine={false}
          dataKey="timestamp"
          minTickGap={20}
          tickFormatter={(value) =>
            `${differenceInHours(endTime, new Date(value)).toString()}h`
          }
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
