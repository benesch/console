import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, BoxProps, VStack } from "@chakra-ui/react";
import React from "react";
import { Route, Routes, useParams } from "react-router-dom";

import { Source, useDDL } from "~/api/materialized";
import { CopyableBox } from "~/components/copyableComponents";
import StatusPill from "~/components/StatusPill";
import { PageBreadcrumbs, PageHeader } from "~/layouts/BaseLayout";

import SourceErrors from "./SourceErrors";

export interface SourceDetailProps {
  source?: Source;
}

const SourceDetail = ({ source }: SourceDetailProps) => {
  const params = useParams();
  const { ddl } = useDDL("SOURCE", source?.name);

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
      <Routes>
        <Route path="/" element={<div>overview</div>} />
        <Route path="errors" element={<SourceErrors source={source} />} />
      </Routes>
    </>
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
