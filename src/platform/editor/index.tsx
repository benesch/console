import { Box, Flex, useToast } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Column } from "react-table";

import { useSql } from "../../api/materialized";
import { Card } from "../../components/cardComponents";
import { BaseLayout } from "../../layouts/BaseLayout";
import Code from "./code";
import Schema from "./schema";
import Table from "./table";

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
    <Flex height={"100%"} gap={5}>
      <Card
        ref={ref}
        key={"schema"}
        data-grid={{
          h: 50,
          i: "schema",
          w: 2,
          x: 0,
          y: 0,
        }}
        overflow={"scroll"}
        background={"purple.900"}
        width="20%"
        minWidth={"20%"}
        height={"100%"}
      >
        <Schema />
      </Card>
      <Flex flexDirection={"column"} flex={1} gap={2} width="100%">
        <Card
          key={"editor"}
          data-grid={{
            h: 25,
            i: "editor",
            w: 9.5,
            x: 2,
            y: 0,
          }}
          overflow="hidden"
        >
          <Code handleQuery={handleQuery} />
        </Card>
        <Card
          key={"table"}
          data-grid={{
            h: 25,
            i: "table",
            w: 9.5,
            x: 2,
            y: 2,
          }}
          overflow="hidden"
        >
          <Box overflow={"scroll"} background={"purple.900"}>
            <Table columns={columns} rows={rows} />
          </Box>
        </Card>
      </Flex>
    </Flex>
  );
};

export default GridLayout;
