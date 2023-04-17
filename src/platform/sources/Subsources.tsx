import {
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
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { useSubsources } from "~/api/materialize/useSubsources";
import ErrorBox from "~/components/ErrorBox";

import { SOURCES_FETCH_ERROR_MESSAGE } from "./constants";

export interface SubsourceProps {
  sourceId?: string;
}

const Subsources = ({ sourceId }: SubsourceProps) => {
  const {
    data: sources,
    isInitiallyLoading: isLoading,
    isError,
  } = useSubsources(sourceId);

  const isEmpty = sources && sources.length === 0;

  return (
    <HStack spacing={6} height="100%">
      <VStack width="100%" spacing={6} height="100%">
        <VStack spacing={6} width="100%" height="100%" alignItems="flex-start">
          <Text fontSize="16px" fontWeight={500}>
            Subsources
          </Text>
          {isError ? (
            <Flex justifyContent="center" width="100%" flex="1">
              <ErrorBox message={SOURCES_FETCH_ERROR_MESSAGE} />
            </Flex>
          ) : isLoading ? (
            <Flex justifyContent="center" width="100%">
              <Spinner data-testid="loading-spinner" />
            </Flex>
          ) : isEmpty ? (
            <Flex width="100%" justifyContent="center">
              No subsources
            </Flex>
          ) : (
            <Table
              variant="standalone"
              data-testid="subsources-table"
              borderRadius="xl"
            >
              <Thead>
                <Tr>
                  <Th>Name</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sources?.map((s) => (
                  <Tr key={s.id}>
                    <Td>{s.name}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </VStack>
        );
      </VStack>
    </HStack>
  );
};

export default Subsources;
