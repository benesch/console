import React from "react";
import { useNavigate } from "react-router-dom";

import SimpleSelect from "./SimpleSelect";

export const timePeriodOptions: Record<string, string> = {
  "15": "Last 15 minutes",
  "60": "Last hour",
  "180": "Last 3 hours",
  "360": "Last 6 hours",
  "720": "Last 12 hours",
  "1440": "Last 24 hours",
  "4320": "Last 3 days",
  "43200": "Last 30 days",
};

const defaultTimePeriod = Object.keys(timePeriodOptions)[0];

export const useTimePeriodMinutes = (defaultValue = defaultTimePeriod) => {
  const [timePeriodMinutes, setTimePeriodMinutes] = React.useState(
    parseTimePeriod(defaultValue)
  );
  return [timePeriodMinutes, setTimePeriodMinutes] as const;
};

const parseTimePeriod = (defaultValue: string) => {
  const params = new URLSearchParams(window.location.search);
  const timePeriodParam = params.get("timePeriod") ?? defaultTimePeriod;
  const period = Object.keys(timePeriodOptions).includes(timePeriodParam)
    ? timePeriodParam
    : defaultValue;
  return parseInt(period);
};

export interface TimePeriodSelectProps {
  timePeriodMinutes: number;
  setTimePeriodMinutes: (val: number) => void;
  options?: Record<string, string>;
}

const TimePeriodSelect = ({
  timePeriodMinutes,
  setTimePeriodMinutes,
  options = timePeriodOptions,
}: TimePeriodSelectProps) => {
  const navigate = useNavigate();
  const setTimePeriod = (timePeriod: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("timePeriod", timePeriod);
    navigate(url.pathname + url.search + url.hash, { replace: true });
    setTimePeriodMinutes(parseInt(timePeriod));
  };

  return (
    <SimpleSelect
      value={timePeriodMinutes}
      onChange={(e) => setTimePeriod(e.target.value)}
    >
      {Object.entries(options).map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </SimpleSelect>
  );
};

export default TimePeriodSelect;
