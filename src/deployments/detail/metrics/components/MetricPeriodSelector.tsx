import { HStack, Text } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import React from "react";

export const MetricPeriodSelector = (props: {
  onSelect: (period: number) => void;
}) => (
  <HStack justifyContent="flex-end">
    <Text>Show the last&nbsp;</Text>
    <Select
      flexBasis={"20%"}
      defaultValue="15"
      onChange={(e) => props.onSelect(parseInt(e.target.value))}
    >
      <option value={5}>5 minutes</option>
      <option value={15}>15 minutes</option>
      <option value={30}>30 minutes</option>
      <option value={60}>hour</option>
      <option value={120}>2 hours</option>
    </Select>
  </HStack>
);
