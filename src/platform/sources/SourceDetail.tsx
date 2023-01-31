import { Box, VStack } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import { Source, useDDL } from "~/api/materialized";
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
import { useRegionSlug } from "~/region";
import { SentryRoutes } from "~/sentry";

import SourceErrors from "./SourceErrors";

export interface SourceDetailProps {
  source?: Source;
}
const SourceDetail = ({ source }: SourceDetailProps) => {
  const params = useParams<SchemaObjectRouteParams>();
  const regionSlug = useRegionSlug();
  const { ddl } = useDDL("SOURCE", source?.name);

  const breadcrumbs: Breadcrumb[] = React.useMemo(
    () => [
      { title: "Sources", href: `${regionSlug}/sources` },
      { title: params.objectName ?? "" },
    ],
    [params.objectName, regionSlug]
  );

  return (
    <>
      <PageHeader>
        <VStack spacing={6} alignItems="start" width="100%">
          <VStack spacing={2} alignItems="start" width="100%">
            <PageBreadcrumbs crumbs={breadcrumbs}>
              {source?.status && (
                <Box>
                  <StatusPill ml={2} status={source.status} />
                </Box>
              )}
            </PageBreadcrumbs>
            {source && (
              <ExpandablePanel text="SHOW CREATE SOURCE">
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
                    The following statement was used to create this source.
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
          <PageTab to={`/sources/${params.sourceName}`} end>
            Overview
          </PageTab>*/}
            <PageTab to="errors">Errors</PageTab>
          </PageTabStrip>
        </VStack>
      </PageHeader>
      <SentryRoutes>
        <Route path="/" element={<Navigate to="errors" replace />} />
        <Route path="errors" element={<SourceErrors source={source} />} />
      </SentryRoutes>
    </>
  );
};

export default SourceDetail;
