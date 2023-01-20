import { Box, VStack } from "@chakra-ui/react";
import React from "react";
import { Route, useParams } from "react-router-dom";

import { Sink, useDDL } from "~/api/materialized";
import { CopyableBox } from "~/components/copyableComponents";
import StatusPill from "~/components/StatusPill";
import {
  ExpandablePanel,
  PageBreadcrumbs,
  PageHeader,
  PageTab,
  PageTabStrip,
} from "~/layouts/BaseLayout";
import { SentryRoutes } from "~/sentry";

import SinkErrors from "./SinkErrors";

export interface SinkDetailProps {
  sink?: Sink;
}

const SinkDetail = ({ sink }: SinkDetailProps) => {
  const params = useParams();
  const { ddl } = useDDL("SINK", sink?.name);

  return (
    <>
      <PageHeader>
        <VStack spacing={6} alignItems="start" width="100%">
          <VStack spacing={2} alignItems="start">
            <PageBreadcrumbs crumbs={["Sinks", params.sinkName ?? ""]}>
              {sink?.status && (
                <Box>
                  <StatusPill ml={2} status={sink.status} />
                </Box>
              )}
            </PageBreadcrumbs>
            {sink && (
              <ExpandablePanel text="SHOW CREATE SINK">
                <Box
                  mt={4}
                  p={6}
                  border="solid 1px"
                  borderRadius="8px"
                  borderColor="semanticColors.border.primary"
                >
                  <Box fontSize="14px" fontWeight="500">
                    {sink.name} DDL Statement
                  </Box>
                  <Box
                    fontSize="14px"
                    color="semanticColors.foreground.secondary"
                  >
                    The following statement was used to create this sink.
                  </Box>
                  <CopyableBox mt={4} contents={ddl ?? ""}>
                    {ddl}
                  </CopyableBox>
                </Box>
              </ExpandablePanel>
            )}
          </VStack>
          <PageTabStrip>
            {/* Hide this until we have content for this tab
          <PageTab to={`/sinks/${params.sinkName}`} end>
            Overview
          </PageTab>*/}
            <PageTab to="errors">Errors</PageTab>
          </PageTabStrip>
        </VStack>
      </PageHeader>
      <SentryRoutes>
        <Route path="/" element={<div>overview</div>} />
        <Route path="errors" element={<SinkErrors sink={sink} />} />
      </SentryRoutes>
    </>
  );
};

export default SinkDetail;
