import { Box, useTheme, VStack } from "@chakra-ui/react";
import React from "react";

import { SUPPORT_HREF } from "~/components/SupportLink";
import TextLink from "~/components/TextLink";
import { MaterializeTheme } from "~/theme";

const GetStartedDocs = () => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <VStack spacing={2} alignItems="stretch">
      <Box
        p={4}
        borderRadius="lg"
        bg={colors.semanticColors.background.secondary}
      >
        <TextLink
          href="https://materialize.com/docs/get-started/"
          target="_blank"
        >
          Connect a streaming source
        </TextLink>{" "}
        and create your first materialized view in seconds.
      </Box>
      <Box p={4}>
        Need more help?{" "}
        <TextLink
          href="https://materialize.com/s/chat"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check out our community slack
        </TextLink>{" "}
        or visit our{" "}
        <TextLink href={SUPPORT_HREF} target="_blank">
          help center.
        </TextLink>
      </Box>
    </VStack>
  );
};

export default GetStartedDocs;
