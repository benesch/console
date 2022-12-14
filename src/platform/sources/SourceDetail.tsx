import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, BoxProps, HStack, Spinner, VStack } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";

import { Source, useDDL } from "~/api/materialized";
import { CopyableBox } from "~/components/copyableComponents";
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
        {source ? <div>{source.name}</div> : <Spinner />}
      </HStack>
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
