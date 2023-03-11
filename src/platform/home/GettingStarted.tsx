import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Navigate, Route } from "react-router-dom";

import segment from "~/analytics/segment";
import { CopyableBox } from "~/components/copyableComponents";
import { useRegionSlug } from "~/region";
import { SentryRoutes } from "~/sentry";
import { MaterializeTheme } from "~/theme";

// These credentials are read only and not considered sensitive
const secrets = `CREATE SECRET kafka_user AS 'CL6M5VSYI32TVILA';
CREATE SECRET kafka_password AS 'swK5gpo9J3uJKaeeHjTkKXnU7qd5Gp90FDJq4CbHKvNnU4kl7uQ1jzVIGsvhHB0K';
CREATE SECRET csr_user AS 'DISCU3R3EBELNOZQ';
CREATE SECRET csr_password AS 'pQwNVqWdGs8P4VUpdYYoHfnpc0B1lqXTmZKD+U3O/yh+vMrAj4jDwTAbHuzSlkei';`;

const handleGettingStartedClick = () => {
  segment.track("Get Started Clicked", {});
};

const handleCopyClick = () => {
  segment.track("Demo Credentials Copied", {});
};

const GettingStarted = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const regionSlug = useRegionSlug();

  return (
    <Box
      borderRadius="lg"
      borderColor={semanticColors.border.info}
      borderWidth="1px"
      overflow="hidden"
    >
      <Box p="4" background={semanticColors.background.info}>
        <HStack spacing={10}>
          <VStack spacing="2" alignItems="start">
            <Heading as="h6" fontSize="sm" lineHeight="16px" fontWeight="500">
              Get started with Materialize
            </Heading>
            <Text
              fontSize="sm"
              lineHeight="20px"
              color={semanticColors.foreground.secondary}
            >
              Learn the basics of Materialize by creating your first set of
              clusters, views, and sources.
            </Text>
          </VStack>
          <Button
            as="a"
            target="_blank"
            rel="noopener"
            href="//materialize.com/docs/get-started/"
            variant="secondary"
            size="sm"
            bg={semanticColors.background.primary}
            onClick={handleGettingStartedClick}
          >
            Get started
          </Button>
        </HStack>
      </Box>
      <SentryRoutes>
        <Route path="showSourceCredentials" element={<CopyableCredentials />} />
        <Route path="" />
        <Route
          path="*"
          element={<Navigate to={`/regions/${regionSlug}/`} replace />}
        />
      </SentryRoutes>
    </Box>
  );
};

const CopyableCredentials = () => {
  return (
    <CopyableBox
      variant="embedded"
      contents={secrets}
      onClick={handleCopyClick}
    >
      {secrets}
    </CopyableBox>
  );
};

export default GettingStarted;
