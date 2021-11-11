import { HStack, Text } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import React from "react";

const durationsInMinutes = {
  hour: 60,
  day: 24 * 60,
  week: 7 * 24 * 60,
  month: 30 * 24 * 60,
};

export const MetricPeriodSelector = (props: {
  onSelect: (period: number) => void;
}) => (
  <HStack>
    <Text>Last&nbsp;</Text>
    <Select
      data-testid="metrics-period-selector-dropdown"
      defaultValue="60"
      onChange={(e) => props.onSelect(parseInt(e.target.value))}
    >
      <option value={durationsInMinutes.hour}>hour</option>
      <option value={durationsInMinutes.day}>day</option>
      <option value={durationsInMinutes.week}>week</option>
      <option value={durationsInMinutes.month}>month</option>
    </Select>
  </HStack>
);
