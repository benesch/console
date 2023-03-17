import { Box, Flex, HStack, Text, useTheme, VStack } from "@chakra-ui/react";
import { subMinutes } from "date-fns";
import React from "react";

import { Source, useSourceErrors } from "~/api/materialized";
import AlertBox from "~/components/AlertBox";
import ConnectorErrorsTable from "~/components/ConnectorErrorsTable";
import TimePeriodSelect, {
  useTimePeriodMinutes,
} from "~/components/TimePeriodSelect";
import { MaterializeTheme } from "~/theme";

import SourceErrorsGraph from "./SourceErrorsGraph";

export interface SourceDetailProps {
  source?: Source;
}

const SourceErrors = ({ source }: SourceDetailProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, setTimePeriodMinutes] = useTimePeriodMinutes();

  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { data: errors, loading } = useSourceErrors({
    sourceId: source?.id,
    startTime,
    endTime,
  });

  return (
    <HStack spacing={6} alignItems="flex-start">
      <VStack width="100%" alignItems="flex-start" spacing={6}>
        <VStack width="100%" alignItems="flex-start" spacing={6}>
          {source?.error && (
            <AlertBox>
              <Text opacity="0.6" color={semanticColors.foreground.primary}>
                Source error
              </Text>
              <Text color={semanticColors.foreground.primary}>
                {source?.error}
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
              mb={4}
            >
              <Text fontSize="16px" fontWeight="500">
                Source Errors
              </Text>
              <TimePeriodSelect
                timePeriodMinutes={timePeriodMinutes}
                setTimePeriodMinutes={setTimePeriodMinutes}
              />
            </Flex>
            <SourceErrorsGraph
              sourceId={source?.id}
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

export default SourceErrors;
