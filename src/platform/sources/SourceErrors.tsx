import {
  Box,
  Flex,
  HStack,
  Select,
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
import { useNavigate } from "react-router-dom";

import { Source, SourceError, useSourceErrors } from "~/api/materialized";

import SourceErrorsGraph from "./SourceErrorsGraph";

export interface SourceDetailProps {
  source?: Source;
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

const defaultTimePeriod = Object.keys(timePeriodOptions)[0];
const parseTimePeriod = () => {
  const params = new URLSearchParams(window.location.search);
  const timePeriodParam = params.get("timePeriod") ?? defaultTimePeriod;
  const period = Object.keys(timePeriodOptions).includes(timePeriodParam)
    ? timePeriodParam
    : defaultTimePeriod;
  return parseInt(period);
};

const SourceErrors = ({ source }: SourceDetailProps) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, setTimePeriodMinutes] = React.useState(
    parseInt(defaultTimePeriod)
  );
  React.useMemo(() => {
    setTimePeriodMinutes(parseTimePeriod());
  }, []);

  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const setTimePeriod = (timePeriod: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("timePeriod", timePeriod);
    navigate(url.pathname + url.search, { replace: true });
    setTimePeriodMinutes(parseInt(timePeriod));
  };
  const { data: errors, loading } = useSourceErrors({
    sourceId: source?.id,
    startTime,
    endTime,
  });

  return (
    <HStack spacing={6} alignItems="flex-start">
      <VStack width="100%" alignItems="flex-start" spacing={6}>
        <Box
          border={`solid 1px ${colors.semanticColors.border.primary}`}
          borderRadius="8px"
          py={4}
          px={6}
          width="100%"
          mb={4}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            mb={2}
          >
            <Text fontSize="16px" fontWeight="500">
              Source Errors
            </Text>
            <Select
              fontSize="14px"
              width="auto"
              value={timePeriodMinutes}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="15">Last 15 minutes</option>
              <option value="60">Last hour</option>
              <option value="180">Last 3 hours</option>
              <option value="360">Last 6 hours</option>
              <option value="720">Last 12 hours</option>
              <option value="1440">Last 24 hours</option>
              <option value="4320">Last 3 days</option>
              <option value="43200">Last 30 days</option>
            </Select>
          </Flex>
          <SourceErrorsGraph
            sourceId={source?.id}
            timePeriodMinutes={timePeriodMinutes}
          />
        </Box>
        <SourceErrorsTable
          errors={errors}
          loading={loading}
          timePeriodMinutes={timePeriodMinutes}
        />
      </VStack>
    </HStack>
  );
};

interface SourceErrorsTableProps {
  errors: SourceError[] | null;
  loading: boolean;
  timePeriodMinutes: number;
}

const SourceErrorsTable = ({
  errors,
  loading,
  timePeriodMinutes,
}: SourceErrorsTableProps) => {
  if (errors?.length === 0) {
    return <Box>No errors</Box>;
  }
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
          data-testid="source-errors-table"
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
                    {format(error.lastOccurred, "HH:mm:ss")}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </VStack>
  );
};

export default SourceErrors;
