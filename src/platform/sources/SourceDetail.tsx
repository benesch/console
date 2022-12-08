import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, HStack, Spinner, VStack } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";

import { Source, useDDL } from "~/api/materialized";
import { PageBreadcrumbs, PageHeader } from "~/layouts/BaseLayout";

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
          <PageBreadcrumbs crumbs={["Sources", params.sourceName ?? ""]} />
          {source && (
            <ExpandablePanel text="SHOW CREATE SINK">{ddl}</ExpandablePanel>
          )}
        </VStack>
      </PageHeader>
      <HStack spacing={6} alignItems="flex-start">
        {source ? <div>{source.name}</div> : <Spinner />}
      </HStack>
    </>
  );
};

export interface ExpandablePanelProps {
  text: string;
  children: React.ReactNode;
}

const ExpandablePanel = ({ text, children }: ExpandablePanelProps) => {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <Box fontSize="xs" onClick={() => setShow(!show)}>
        {text}
        {show ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Box>
      {show && children}
    </>
  );
};

export default SourceDetail;
