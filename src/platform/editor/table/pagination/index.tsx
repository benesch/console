import { Button, Flex, Input, Select, Text } from "@chakra-ui/react";
import React, { ChangeEvent } from "react";

interface Props {
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  pageOptions: any;
  gotoPage: (page: number) => void;
  handlePageSize: (e: ChangeEvent<HTMLSelectElement> | undefined) => void;
  nextPage: () => void;
  previousPage: () => void;
}

const Pagination = (props: Props): JSX.Element => {
  const {
    canPreviousPage,
    canNextPage,
    pageCount,
    pageIndex,
    pageOptions,
    pageSize,
    gotoPage,
    handlePageSize,
    previousPage,
    nextPage,
  } = props;

  const handleGoToPage = (e: ChangeEvent<HTMLInputElement> | undefined) => {
    if (e) {
      const page = e.target.value ? Number(e.target.value) - 1 : 0;
      gotoPage(page);
    }
  };

  return (
    <Flex flexFlow={"row"} alignItems="center" justifyContent={"space-around"}>
      <Flex flexFlow={"row"} justifyContent={"space-around"}>
        <Button
          size={"xs"}
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          marginX={1}
        >
          {"<<"}
        </Button>{" "}
        <Button
          size={"xs"}
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          marginX={1}
        >
          {"<"}
        </Button>{" "}
        <Button
          size={"xs"}
          onClick={() => nextPage()}
          disabled={!canNextPage}
          marginX={1}
        >
          {">"}
        </Button>{" "}
        <Button
          size={"xs"}
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
          marginX={1}
        >
          {">>"}
        </Button>{" "}
      </Flex>
      <Flex flexFlow={"row"} flexShrink={0} alignItems="center">
        <Text fontSize={"sm"}>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length || 1}
          </strong>{" "}
          | Go to page:{" "}
        </Text>
        <Input
          size={"xs"}
          type="number"
          defaultValue={pageIndex + 1}
          onChange={handleGoToPage}
          width={100}
          marginLeft={2}
        />
      </Flex>{" "}
      <Select
        size={"xs"}
        value={pageSize}
        onChange={handlePageSize}
        width={"20%"}
        height={8}
      >
        {[10, 50, 100, 500, 1000].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </Select>
    </Flex>
  );
};

export default Pagination;
