import { Box, Flex, HStack, Text, useTheme, VStack } from "@chakra-ui/react";
import { subMinutes } from "date-fns";
import React from "react";

import { Sink, useSinkErrors } from "~/api/materialized";
import AlertBox from "~/components/AlertBox";
import ConnectorErrorsTable from "~/components/ConnectorErrorsTable";
import TimePeriodSelect, {
  useTimePeriodMinutes,
} from "~/components/TimePeriodSelect";
import { MaterializeTheme } from "~/theme";

import SinkErrorsGraph from "./SinkErrorsGraph";

export interface SinkDetailProps {
  sink?: Sink;
}

const SinkErrors = ({ sink }: SinkDetailProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, setTimePeriodMinutes] = useTimePeriodMinutes();

  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { data: errors, loading } = useSinkErrors({
    sinkId: sink?.id,
    startTime,
    endTime,
  });

  return (
    <HStack spacing={6} alignItems="flex-start">
      <VStack width="100%" alignItems="flex-start" spacing={6}>
        <VStack width="100%" alignItems="flex-start" spacing={4}>
          {sink?.error && (
            <AlertBox>
              <Text opacity="0.6" color={semanticColors.foreground.primary}>
                Sink error
              </Text>
              <Text color={semanticColors.foreground.primary}>
                {sink?.error}
              </Text>
            </AlertBox>
          )}
          <Box
            border={`solid 1px ${semanticColors.border.primary}`}
            borderRadius="8px"
            py={4}
            px={6}
            width="100%"
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              mb={2}
            >
              <Text fontSize="16px" fontWeight="500">
                Sink Errors
              </Text>
              <TimePeriodSelect
                timePeriodMinutes={timePeriodMinutes}
                setTimePeriodMinutes={setTimePeriodMinutes}
              />
            </Flex>
            <SinkErrorsGraph
              sinkId={sink?.id}
              timePeriodMinutes={timePeriodMinutes}
            />
          </Box>
          <ConnectorErrorsTable
            errors={errors}
            loading={loading}
            timePeriodMinutes={timePeriodMinutes}
          />
        </VStack>
      </VStack>
    </HStack>
  );
};

export default SinkErrors;
