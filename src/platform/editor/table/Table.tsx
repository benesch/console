import {
  Box,
  Flex,
  Table as ChakraTable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { ChangeEvent } from "react";
import {
  Cell,
  Column,
  HeaderGroup,
  Row,
  usePagination,
  useTable,
} from "react-table";

import { semanticColors } from "../../../theme/colors";
import Pagination from "./Pagination";

interface Props {
  columns: Array<Column>;
  rows: Array<any>;
  loading?: boolean;
}

const Table: React.FC<React.PropsWithChildren<Props>> = ({
  columns,
  rows: data,
  loading,
}: Props): JSX.Element => {
  /**
   * Hooks
   */
  const defaultColumn = React.useMemo(
    () => ({
      width: 150,
      maxWidth: 150,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // Get the state from the instance
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    usePagination
  );

  const dividerColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );

  /**
   * Handlers
   */
  const handlePageSize = (e: ChangeEvent<HTMLSelectElement> | undefined) => {
    if (e) {
      setPageSize(e.target.value);
    }
  };

  return (
    <Flex flexFlow="column" height="100%" mx="1px" overflowY="hidden">
      <Box
        flex={1}
        overflow="auto"
        borderBottom="1px solid"
        borderColor={dividerColor}
        py={1}
      >
        <ChakraTable {...getTableProps()} style={{ borderSpacing: 0 }}>
          <Thead>
            {headerGroups.map((headerGroup: HeaderGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column: HeaderGroup) => (
                  <Th
                    {...column.getHeaderProps({})}
                    margin="0"
                    px={2}
                    py={1}
                    width="1%"
                    borderBottom="1px solid"
                    borderColor={loading ? "gray.200" : "gray.500"}
                    color={loading ? "gray.400" : "default"}
                    key={column.id}
                  >
                    {column.render("Header")}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {page.map((row: Row) => {
              prepareRow(row);
              const { getRowProps } = row;
              return (
                <Tr key={getRowProps().key} height={5}>
                  {row.cells.map((cell: Cell) => {
                    const { getCellProps, render } = cell;
                    return (
                      <Td
                        {...getCellProps()}
                        key={getCellProps().key}
                        px={2}
                        py={1}
                      >
                        {render("Cell")}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </ChakraTable>
      </Box>
      {/* Pagination */}
      <Box padding={1}>
        <Pagination
          loading={loading}
          canNextPage={canNextPage}
          canPreviousPage={canPreviousPage}
          gotoPage={gotoPage}
          handlePageSize={handlePageSize}
          nextPage={nextPage}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageOptions={pageOptions}
          pageSize={pageSize}
          previousPage={previousPage}
        />
      </Box>
    </Flex>
  );
};

export default Table;
