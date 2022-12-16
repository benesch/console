import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";
import { useParams } from "react-router-dom";

import {
  Source,
  SourceError,
  useDDL,
  useSourceErrors,
} from "~/api/materialized";
import { CopyableBox } from "~/components/copyableComponents";
import StatusPill from "~/components/StatusPill";
import { PageBreadcrumbs, PageHeader } from "~/layouts/BaseLayout";

export interface SourceDetailProps {
  source?: Source;
}

const SourceDetail = ({ source }: SourceDetailProps) => {
  const params = useParams();
  const { ddl } = useDDL("SOURCE", source?.name);
  const { errors } = useSourceErrors({ sourceId: source?.id });

  return (
    <>
      <PageHeader>
        <VStack spacing={1} alignItems="start">
          <PageBreadcrumbs crumbs={["Sources", params.sourceName ?? ""]}>
            {source?.status && <StatusPill status={source.status} />}
          </PageBreadcrumbs>
          {source && (
            <ExpandablePanel text="SHOW CREATE SINK">
              <Box
                mt={4}
                p={6}
                border="solid 1px"
                borderRadius="8px"
                borderColor="semanticColors.border.primary"
              >
                <Box fontSize="14px" fontWeight="500">
                  {source.name} DDL Statement
                </Box>
                <Box
                  fontSize="14px"
                  color="semanticColors.foreground.secondary"
                >
                  The following statement was used to create this sink.
                </Box>
                <CopyableBox mt={4} contents={ddl}>
                  {ddl}
                </CopyableBox>
              </Box>
            </ExpandablePanel>
          )}
        </VStack>
      </PageHeader>
      <HStack spacing={6} alignItems="flex-start">
        {errors ? <SourceErrorsTable errors={errors} /> : <Spinner />}
      </HStack>
    </>
  );
};

interface SourceErrorsTableProps {
  errors: SourceError[];
}

const SourceErrorsTable = ({ errors }: SourceErrorsTableProps) => {
  if (errors.length === 0) {
    return <Box>No errors</Box>;
  }
  return (
    <Table
      variant="borderless"
      data-testid="source-errors-table"
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
          <Tr key={error.lastOccurred.getMilliseconds()}>
            <Td>{error.error}</Td>
            <Td>{error.count}</Td>
            <Td>{format(error.lastOccurred, "MM-dd-yy HH:mm:ss")}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export type ExpandablePanelProps = BoxProps & {
  text: string;
  children: React.ReactNode;
};

const ExpandablePanel = ({
  text,
  children,
  ...boxProps
}: ExpandablePanelProps) => {
  const [show, setShow] = React.useState(false);

  return (
    <Box>
      <Box
        color="semanticColors.accent.purple"
        fontSize="xs"
        onClick={() => setShow(!show)}
        {...boxProps}
      >
        {text}
        {show ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Box>
      {show && children}
    </Box>
  );
};

export default SourceDetail;
