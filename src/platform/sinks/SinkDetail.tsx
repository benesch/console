import { Box, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import { Sink, useSchemaObjectDDLStatement } from "~/api/materialized";
import ConnectModal from "~/components/ConnectModal";
import { CopyableBox } from "~/components/copyableComponents";
import StatusPill from "~/components/StatusPill";
import {
  Breadcrumb,
  ExpandablePanel,
  PageBreadcrumbs,
  PageHeader,
  PageTab,
  PageTabStrip,
} from "~/layouts/BaseLayout";
import { SchemaObjectRouteParams } from "~/platform/schemaObjectRouteHelpers";
import { SentryRoutes } from "~/sentry";

import SinkErrors from "./SinkErrors";

export interface SinkDetailProps {
  sink?: Sink;
}

const SinkDetail = ({ sink }: SinkDetailProps) => {
  const params = useParams<SchemaObjectRouteParams>();
  const { ddl } = useSchemaObjectDDLStatement("SINK", sink?.name);

  const breadcrumbs: Breadcrumb[] = React.useMemo(
    () => [{ title: "Sinks", href: ".." }, { title: params.objectName ?? "" }],
    [params.objectName]
  );

  return (
    <>
      <PageHeader>
        <VStack spacing={6} alignItems="start" width="100%">
          <VStack spacing={2} alignItems="start" width="100%">
            <HStack justifyContent="space-between" width="100%">
              <PageBreadcrumbs crumbs={breadcrumbs}>
                {sink?.status && (
                  <Box>
                    <StatusPill ml={2} status={sink.status} />
                  </Box>
                )}
              </PageBreadcrumbs>
              <ConnectModal />
            </HStack>
            {sink && (
              <ExpandablePanel text="SHOW CREATE SINK">
                <Box
                  mt={0}
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
        <Route path="/" element={<Navigate to="errors" replace />} />
        <Route path="errors" element={<SinkErrors sink={sink} />} />
      </SentryRoutes>
    </>
  );
};

export default SinkDetail;
