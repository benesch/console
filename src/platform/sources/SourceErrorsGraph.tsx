import { differenceInHours, subMinutes } from "date-fns";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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
      <LineChart data={statuses}>
        <Line type="linear" dataKey="count" stroke="#8884d8" />
        <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="4" />
        <XAxis
          allowDataOverflow={false}
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
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SourceErrorsGraph;
