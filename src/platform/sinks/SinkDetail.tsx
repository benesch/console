import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import useShowCreate from "~/api/materialize/useShowCreate";
import { SinksResponse } from "~/api/materialized";
import ConnectModal from "~/components/ConnectModal";
import { CopyableBox } from "~/components/copyableComponents";
import StatusPill from "~/components/StatusPill";
import {
  Breadcrumb,
  ExpandablePanel,
  PageBreadcrumbs,
  PageHeader,
  PageTabStrip,
} from "~/layouts/BaseLayout";
import { SchemaObjectRouteParams } from "~/platform/schemaObjectRouteHelpers";
import { SentryRoutes } from "~/sentry";
import DiamondErrorIcon from "~/svg/DiamondErrorIcon";

import SinkErrors from "./SinkErrors";

export interface SinkDetailProps {
  sinksResponse: SinksResponse;
}

const SinkDetail = ({ sinksResponse }: SinkDetailProps) => {
  const { id: sinkId, objectName } = useParams<SchemaObjectRouteParams>();
  const { getSinkById } = sinksResponse;
  const sink = getSinkById(sinkId) ?? undefined;

  const { ddl, isError: isShowCreateError } = useShowCreate("SINK", sink);

  const breadcrumbs: Breadcrumb[] = React.useMemo(
    () => [{ title: "Sinks", href: ".." }, { title: objectName ?? "" }],
    [objectName]
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
                  mt={2}
                  p={6}
                  border="solid 1px"
                  borderRadius="8px"
                  borderColor="semanticColors.border.primary"
                >
                  {isShowCreateError ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      color="semanticColors.foreground.secondary"
                    >
                      <DiamondErrorIcon />
                      <Text fontSize="sm" lineHeight="16px" marginLeft={2}>
                        There was an error loading your DDL. Please refresh the
                        page.
                      </Text>
                    </Box>
                  ) : (
                    <>
                      <Box fontSize="14px" fontWeight="500">
                        {sink.name} DDL Statement
                      </Box>
                      <Box
                        fontSize="14px"
                        color="semanticColors.foreground.secondary"
                      >
                        The following statement was used to create this sink.
                      </Box>
                      <CopyableBox
                        mt={4}
                        contents={ddl ?? ""}
                        maxHeight="200px"
                      >
                        {ddl}
                      </CopyableBox>
                    </>
                  )}
                </Box>
              </ExpandablePanel>
            )}
          </VStack>
          <PageTabStrip
            tabData={[
              /* Hide this until we have content for this tab
             { label: "Overview", href: `/sinks/${params.sinkName}` } */
              { label: "Errors", href: "errors" },
            ]}
          />
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
