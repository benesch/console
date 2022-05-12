import {
  Box,
  Table as ChakraTable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { useFlexLayout, useTable } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

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
      minWidth: 20,
      width: 150,
      maxWidth: 150,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        defaultColumn,
      },
      useFlexLayout
    );

  /**
   * Renders
   */
  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <Tr {...row.getRowProps({ style })}>
          {row.cells.map((cell) => {
            return (
              <Td
                {...cell.getCellProps()}
                margin="0"
                padding="0.5rem"
                width="1%"
                borderBottom="1px"
                borderColor={"gray.700"}
                key={cell.getCellProps().key}
              >
                {cell.render("Cell")}
              </Td>
            );
          })}
        </Tr>
      );
    },
    [prepareRow, rows]
  );

  return (
    <Box style={{ display: "block" }}>
      <Box
        display="block"
        height={"360px"}
        maxWidth="100%"
        overflowX="scroll"
        overflowY="hidden"
        borderBottom="1px"
        borderColor="gray.700"
      >
        {/* Add border spacing */}
        <ChakraTable
          {...getTableProps()}
          width="100%"
          height="100%"
          style={{ borderSpacing: 0 }}
        >
          <Thead>
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
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
            <AutoSizer>
              {({ width: autoWidth }) => {
                return (
                  <>
                    <FixedSizeList
                      height={305}
                      itemCount={rows.length}
                      itemSize={35}
                      width={autoWidth}
                    >
                      {RenderRow}
                    </FixedSizeList>
                  </>
                );
              }}
            </AutoSizer>
          </Tbody>
        </ChakraTable>
      </Box>
    </Box>
  );
};

export default Table;
