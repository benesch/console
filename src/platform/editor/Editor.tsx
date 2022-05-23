import { Box, Flex, useColorModeValue, useToast } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Column } from "react-table";

import { useSql } from "../../api/materialized";
import { Card } from "../../components/cardComponents";
import Code from "./code/Code";
import Schema from "./Schema";
import Table from "./table/Table";

/**
 * Column rendering for text
 * @returns a function that creates a JSX.Elemet
 */
function columnCell(): (cellData: any) => JSX.Element {
  return function (cellData: any) {
    return (
      <Box
        maxWidth={150}
        whiteSpace="nowrap"
        textOverflow={"ellipsis"}
        overflow={"hidden"}
        fontWeight={300}
        fontSize="sm"
      >
        {cellData.value}
      </Box>
    );
  };
}

interface State {
  rows: Array<any>;
  columns: Array<Column>;
}

const GridLayout = (): JSX.Element => {
  /**
   * States
   */
  const [query, setQuery] = useState<string>();
  const { data, error } = useSql(query);
  const [{ rows, columns }, setState] = useState<State>({
    rows: [],
    columns: [],
  });
  const ref = useRef(null);

  /**
   * Styles (Smaller glow due to background and overflows)
   */
  const shadow = useColorModeValue("glowLight", "smallGlowDark");

  /**
   * Hooks
   */
  const toast = useToast();

  /**
   * Effects
   */
  useEffect(() => {
    if (data) {
      const { rows: dataRows, columns: dataColumns } = data;
      const tableColumns = (dataColumns || []).map((column, index) => ({
        Header: column,
        accessor: (originalRow: any) => originalRow[index],
        id: column + index,
        Cell: columnCell(),
      }));

      setState({
        rows: dataRows || [],
        columns: tableColumns,
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      /**
       * Capitalize Materialize's error message
       */
      const capError =
        error.length > 0 && error.charAt(0).toUpperCase() + error.slice(1);

      toast({
        title: `Ouch. ${capError}`,
        status: "error",
      });
    }
  }, [error]);

  /**
   * Handlers
   * @param newQuery Query to run agains Materialize
   */
  const handleQuery = (newQuery: string) => {
    setQuery(newQuery);
  };

  return (
    <Flex height={"100%"} width={"100%"} gap={5} overflow="hidden">
      <Box paddingY={6} minWidth={"20%"} width="20%">
        <Card
          ref={ref}
          key={"schema"}
          overflow={"scroll"}
          height={"100%"}
          shadow={shadow}
        >
          <Schema />
        </Card>
      </Box>
      <Flex
        flexDirection={"column"}
        flex={1}
        gap={2}
        overflowX={"hidden"}
        padding={6}
      >
        <Card key={"editor"} overflow="hidden" flex={1} shadow={shadow}>
          <Code handleQuery={handleQuery} />
        </Card>
        <Card key={"table"} overflow="hidden" flex={1} shadow={shadow}>
          <Box height={"100%"}>
            <Table columns={columns} rows={rows} />
          </Box>
        </Card>
      </Flex>
    </Flex>
  );
};

export default GridLayout;
