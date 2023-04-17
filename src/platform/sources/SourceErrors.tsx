import { Box, Flex, HStack, Text, useTheme, VStack } from "@chakra-ui/react";
import { subMinutes } from "date-fns";
import React from "react";
import { useParams } from "react-router-dom";

import { SourcesResponse } from "~/api/materialize/useSources";
import { useSourceErrors } from "~/api/materialized";
import AlertBox from "~/components/AlertBox";
import ConnectorErrorsTable from "~/components/ConnectorErrorsTable";
import TimePeriodSelect, {
  useTimePeriodMinutes,
} from "~/components/TimePeriodSelect";
import { MaterializeTheme } from "~/theme";

import { SchemaObjectRouteParams } from "../schemaObjectRouteHelpers";
import { SOURCES_FETCH_ERROR_MESSAGE } from "./constants";
import SourceErrorsGraph from "./SourceErrorsGraph";

export interface SourceDetailProps {
  sourcesResponse: SourcesResponse;
}

const SourceErrors = ({ sourcesResponse }: SourceDetailProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, setTimePeriodMinutes] = useTimePeriodMinutes();

  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { id: sourceId } = useParams<SchemaObjectRouteParams>();

  const { getSourceById } = sourcesResponse;

  const source = getSourceById(sourceId);

  const {
    data: errors,
    isInitiallyLoading: isLoading,
    isError,
  } = useSourceErrors({
    sourceId,
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
            <SourceErrorsGraph timePeriodMinutes={timePeriodMinutes} />
          </Box>
          <ConnectorErrorsTable
            errors={errors}
            isError={isError}
            isLoading={isLoading}
            timePeriodMinutes={timePeriodMinutes}
            errorMessage={SOURCES_FETCH_ERROR_MESSAGE}
          />
        </VStack>
      </VStack>
    </HStack>
  );
};

export default SourceErrors;
