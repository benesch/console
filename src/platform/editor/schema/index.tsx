import {
  Box,
  Flex,
  Icon,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import {
  HiOutlineDatabase,
  HiOutlineTable,
  HiOutlineTemplate,
} from "react-icons/hi";

import { useSql } from "../../../api/materialized";

const Schema = (): JSX.Element => {
  /**
   * Hooks
   */
  const { data: viewsData } = useSql("SHOW VIEWS;");
  const { data: sourcesData } = useSql("SHOW SOURCES;");
  const { data: tablesData } = useSql("SHOW TABLES;");

  return (
    <Table variant="simple" textAlign={"center"}>
      <Thead position={"sticky"}>
        <Tr>
          <Th>Schema</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sourcesData &&
          sourcesData.rows.map(([sourceName]) => (
            <Tr key={sourceName}>
              <Td>
                <Flex alignItems={"center"} gap={"0.5rem"}>
                  <Icon as={HiOutlineDatabase} /> {sourceName}
                </Flex>
              </Td>
            </Tr>
          ))}
        {viewsData &&
          viewsData.rows.map(([viewName]) => (
            <Tr key={viewName}>
              <Td>
                <Flex alignItems={"center"} gap={"0.5rem"}>
                  <Icon as={HiOutlineTemplate} /> <Text>{viewName}</Text>
                </Flex>
              </Td>
            </Tr>
          ))}
        {tablesData &&
          tablesData.rows.map(([tableName]) => (
            <Tr key={tableName}>
              <Td>
                <Flex alignItems={"center"} gap={"0.5rem"}>
                  <Icon as={HiOutlineTable} /> <Text>{tableName}</Text>
                </Flex>
              </Td>
            </Tr>
          ))}
      </Tbody>
    </Table>
  );
};

export default Schema;
