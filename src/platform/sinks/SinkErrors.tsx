import {
  Box,
  Flex,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import { format, subMinutes } from "date-fns";
import React from "react";

import { GroupedError, Sink, useSinkErrors } from "~/api/materialized";
import AlertBox from "~/components/AlertBox";
import TimePeriodSelect, {
  useTimePeriodMinutes,
} from "~/components/TimePeriodSelect";

import SinkErrorsGraph from "./SinkErrorsGraph";

export interface SinkDetailProps {
  sink?: Sink;
}

const timePeriodOptions: Record<string, string> = {
  "15": "Last 15 minutes",
  "60": "Last hour",
  "180": "Last 3 hours",
  "360": "Last 6 hours",
  "720": "Last 12 hours",
  "1440": "Last 24 hours",
  "4320": "Last 3 days",
  "43200": "Last 30 days",
};

const titleForTimePeriod = (timePeriodMinutes: number) => {
  const period = timePeriodOptions[timePeriodMinutes.toString()];
  return `Errors over the ${period.toLowerCase()}`;
};

const SinkErrors = ({ sink }: SinkDetailProps) => {
  const { colors } = useTheme();
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
              <Text opacity="0.6" color="semanticColors.foreground.primary">
                Sink error
              </Text>
              <Text color="semanticColors.foregroun.primary">
                {sink?.error}
              </Text>
            </AlertBox>
          )}
          <Box
            border={`solid 1px ${colors.semanticColors.border.primary}`}
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
          <SinkErrorsTable
            errors={errors}
            loading={loading}
            timePeriodMinutes={timePeriodMinutes}
          />
        </VStack>
      </VStack>
    </HStack>
  );
};

interface SinkErrorsTableProps {
  errors: GroupedError[] | null;
  loading: boolean;
  timePeriodMinutes: number;
}

const SinkErrorsTable = ({
  errors,
  loading,
  timePeriodMinutes,
}: SinkErrorsTableProps) => {
  return (
    <VStack spacing={6} width="100%" alignItems="flex-start">
      <Text fontSize="16px" fontWeight={500}>
        {titleForTimePeriod(timePeriodMinutes)}
      </Text>
      {!errors || loading ? (
        <Flex justifyContent="center" width="100%">
          <Spinner />
        </Flex>
      ) : (
        <Table
          variant="borderless"
          data-testid="sink-errors-table"
          borderRadius="xl"
        >
          <Thead>
            <Tr>
              <Th>Error</Th>
              <Th>Count</Th>
              <Th>Last encountered</Th>
            </Tr>
          </Thead>
          <Tbody>
            {errors.map((error) => (
              <Tr
                key={error.lastOccurred.getMilliseconds()}
                sx={{
                  _hover: {
                    backgroundColor: "semanticColors.background.secondary",
                  },
                }}
              >
                <Td
                  borderBottomWidth="1px"
                  borderBottomColor="semanticColors.border.primary"
                >
                  {error.error}
                </Td>
                <Td
                  borderBottomWidth="1px"
                  borderBottomColor="semanticColors.border.primary"
                >
                  {error.count}
                </Td>
                <Td
                  borderBottomWidth="1px"
                  borderBottomColor="semanticColors.border.primary"
                >
                  <Text
                    color="semanticColors.foreground.secondary"
                    display="inline"
                  >
                    {format(error.lastOccurred, "MM-dd-yy")}
                  </Text>
                  <Text
                    color="semanticColors.foreground.secondary"
                    display="inline"
                  >
                    {" · "}
                  </Text>
                  <Text
                    color="semanticColors.foreground.primary"
                    display="inline"
                  >
                    {format(error.lastOccurred, "HH:mm:ss")} UTC
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {errors?.length === 0 && (
        <Flex width="100%" justifyContent="center">
          No errors
        </Flex>
      )}
    </VStack>
  );
};

export default SinkErrors;
