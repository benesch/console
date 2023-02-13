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

export interface SubsourceProps {
  sourceId?: string;
}

const Subsources = ({ sourceId }: SubsourceProps) => {
  const { data: sources, loading } = useSubsources(sourceId);

  return (
    <HStack spacing={6} alignItems="flex-start">
      <VStack width="100%" alignItems="flex-start" spacing={6}>
        <VStack spacing={6} width="100%" alignItems="flex-start">
          <Text fontSize="16px" fontWeight={500}>
            Subsources
          </Text>
          {!sources || loading ? (
            <Flex justifyContent="center" width="100%">
              <Spinner data-testid="loading-spinner" />
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
                {sources.map((s) => (
                  <Tr key={s.id}>
                    <Td>{s.name}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
          {sources?.length === 0 && (
            <Flex width="100%" justifyContent="center">
              No subsources
            </Flex>
          )}
        </VStack>
        );
      </VStack>
    </HStack>
  );
};

export default Subsources;
