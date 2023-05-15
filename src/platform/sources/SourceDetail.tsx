import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import useShowCreate from "~/api/materialize/useShowCreate";
import { SourcesResponse } from "~/api/materialize/useSources";
import ConnectModal from "~/components/ConnectModal";
import { CopyableBox } from "~/components/copyableComponents";
import StatusPill, {
  getConnectorBackgroundColor,
  getConnectorTextColor,
  getSourceIcon,
} from "~/components/StatusPill";
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

import SourceErrors from "./SourceErrors";
import Subsources from "./Subsources";

export interface SourceDetailProps {
  sourcesResponse: SourcesResponse;
}
const SourceDetail = ({ sourcesResponse }: SourceDetailProps) => {
  const { getSourceById } = sourcesResponse;
  const params = useParams<SchemaObjectRouteParams>();
  const source = getSourceById(params.id) ?? undefined;
  const { ddl, isError: isShowCreateError } = useShowCreate("SOURCE", source);

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
        <VStack spacing={4} alignItems="start" width="100%">
          <VStack spacing={2} alignItems="start" width="100%">
            <HStack justifyContent="space-between" width="100%">
              <PageBreadcrumbs crumbs={breadcrumbs}>
                {source?.status && (
                  <Box>
                    <StatusPill
                      ml={2}
                      status={source.status}
                      backgroundColor={getConnectorBackgroundColor(
                        source.status
                      )}
                      textColor={getConnectorTextColor(source.status)}
                      icon={getSourceIcon(source.status)}
                    />
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
                        {source.name} DDL Statement
                      </Box>
                      <Box
                        fontSize="14px"
                        color="semanticColors.foreground.secondary"
                      >
                        The following statement was used to create this source.
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
              /* { to: `/sources/${params.sourceName}`, label: "Overview" }, */
              { href: `errors`, label: "Errors" },
              { href: `subsources`, label: "Subsources" },
            ]}
          />
        </VStack>
      </PageHeader>
      <SentryRoutes>
        <Route path="/" element={<Navigate to="errors" replace />} />
        <Route
          path="errors"
          element={<SourceErrors sourcesResponse={sourcesResponse} />}
        />
        <Route
          path="subsources"
          element={<Subsources sourceId={params.id} />}
        />
      </SentryRoutes>
    </>
  );
};

export default SourceDetail;
