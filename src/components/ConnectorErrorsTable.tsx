import {
  Flex,
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
import { format } from "date-fns";
import React from "react";

import { GroupedError } from "~/api/materialized";
import { MaterializeTheme } from "~/theme";

import { timePeriodOptions } from "./TimePeriodSelect";

interface ConnectorErrorsTableProps {
  errors: GroupedError[] | null;
  loading: boolean;
  timePeriodMinutes: number;
}

const titleForTimePeriod = (timePeriodMinutes: number) => {
  const period = timePeriodOptions[timePeriodMinutes.toString()];
  return `Errors over the ${period.toLowerCase()}`;
};

const ConnectorErrorsTable = ({
  errors,
  loading,
  timePeriodMinutes,
}: ConnectorErrorsTableProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

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
          data-testid="connnector-errors-table"
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
                    backgroundColor: semanticColors.background.secondary,
                  },
                }}
              >
                <Td
                  borderBottomWidth="1px"
                  borderBottomColor={semanticColors.border.primary}
                >
                  {error.error}
                </Td>
                <Td
                  borderBottomWidth="1px"
                  borderBottomColor={semanticColors.border.primary}
                >
                  {error.count}
                </Td>
                <Td
                  borderBottomWidth="1px"
                  borderBottomColor={semanticColors.border.primary}
                >
                  <Text
                    color={semanticColors.foreground.secondary}
                    display="inline"
                  >
                    {format(error.lastOccurred, "MM-dd-yy")}
                  </Text>
                  <Text
                    color={semanticColors.foreground.secondary}
                    display="inline"
                  >
                    {" · "}
                  </Text>
                  <Text
                    color={semanticColors.foreground.primary}
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

export default ConnectorErrorsTable;
