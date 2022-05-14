import {
  Box,
  Flex,
  Table as ChakraTable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { ChangeEvent } from "react";
import { usePagination, useTable } from "react-table";

import Pagination from "./pagination";

interface Props {
  columns: Array<any>;
  rows: Array<any>;
}

const Table = ({ columns, rows: data }: Props): JSX.Element => {
  /**
   * Hooks
   */
  const defaultColumn = React.useMemo(
    () => ({
      // minWidth: 20,
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
      // initialState: { pageIndex: 0 }, // Pass our hoisted table state
    },
    // useFlexLayout,
    usePagination
  ) as any;

  /**
   * Handlers
   */
  const handlePageSize = (e: ChangeEvent<HTMLSelectElement> | undefined) => {
    if (e) {
      setPageSize(e.target.value);
    }
  };

  return (
    <Flex flexFlow={"column"} height="100%">
      {/* Add border spacing */}
      <Box flex={1} overflowX={"scroll"}>
        <ChakraTable {...getTableProps()} style={{ borderSpacing: 0 }}>
          <Thead>
            {headerGroups.map((headerGroup: any) => (
              <Tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column: any) => (
                  <Th
                    {...column.getHeaderProps({})}
                    margin="0"
                    padding="0.5rem"
                    width="1%"
                    borderBottom="1px"
                    borderColor="gray.700"
                    key={column.id}
                  >
                    {column.render("Header")}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {page.map((row: any, i: number) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()} key={row.key}>
                  {row.cells.map((cell: any) => {
                    return (
                      <Td key={cell.key} {...cell.getCellProps()} padding={0.5}>
                        {cell.render("Cell")}
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
