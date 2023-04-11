import { Box, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import { Source } from "~/api/materialize/useSources";
import { useShowCreate } from "~/api/materialized";
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

import SourceErrors from "./SourceErrors";
import Subsources from "./Subsources";

export interface SourceDetailProps {
  source?: Source;
}
const SourceDetail = ({ source }: SourceDetailProps) => {
  const params = useParams<SchemaObjectRouteParams>();
  const { ddl } = useShowCreate("SOURCE", source);

  const breadcrumbs: Breadcrumb[] = React.useMemo(
    () => [
      { title: "Sources", href: ".." },
      { title: params.objectName ?? "" },
    ],
    [params.objectName]
  );

  return (
    <>
      <PageHeader>
        <VStack spacing={6} alignItems="start" width="100%">
          <VStack spacing={2} alignItems="start" width="100%">
            <HStack justifyContent="space-between" width="100%">
              <PageBreadcrumbs crumbs={breadcrumbs}>
                {source?.status && (
                  <Box>
                    <StatusPill ml={2} status={source.status} />
                  </Box>
                )}
              </PageBreadcrumbs>
              <ConnectModal />
            </HStack>
            {source && (
              <ExpandablePanel text="SHOW CREATE SOURCE">
                <Box
                  mt={2}
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
                    The following statement was used to create this source.
                  </Box>
                  <CopyableBox mt={4} contents={ddl ?? ""} maxHeight="200px">
                    {ddl}
                  </CopyableBox>
                </Box>
              </ExpandablePanel>
            )}
          </VStack>
          <PageTabStrip>
            {/* Hide this until we have content for this tab
          <PageTab to={`/sources/${params.sourceName}`} end>
            Overview
          </PageTab>*/}
            <PageTab to="errors">Errors</PageTab>
            <PageTab to="subsources">Subsources</PageTab>
          </PageTabStrip>
        </VStack>
      </PageHeader>
      <SentryRoutes>
        <Route path="/" element={<Navigate to="errors" replace />} />
        <Route path="errors" element={<SourceErrors source={source} />} />
        <Route
          path="subsources"
          element={<Subsources sourceId={params.id} />}
        />
      </SentryRoutes>
    </>
  );
};

export default SourceDetail;
