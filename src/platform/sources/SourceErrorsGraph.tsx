import { useTheme } from "@chakra-ui/react";
import { differenceInHours, subMinutes } from "date-fns";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { useSourceStatuses } from "~/api/materialized";

export interface Props {
  sourceId: string;
  timePeriodMinutes: number;
}

const SourceErrorsGraph = ({ sourceId, timePeriodMinutes }: Props) => {
  const { colors } = useTheme();
  const endTime = React.useMemo(() => new Date(), []);
  const startTime = React.useMemo(
    () => subMinutes(endTime, timePeriodMinutes),
    [timePeriodMinutes, endTime]
  );
  const bucketSizeSeconds = React.useMemo(() => {
    return (timePeriodMinutes / 15) * 60;
  }, [timePeriodMinutes]);
  const { statuses } = useSourceStatuses({
    sourceId: sourceId,
    startTime,
    endTime,
    bucketSizeSeconds,
  });

  if (!statuses) return null;

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
            differenceInHours(endTime, new Date(value)).toString()
          }
        />
        <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
        <Bar dataKey="count" fill={colors.red[500]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SourceErrorsGraph;
