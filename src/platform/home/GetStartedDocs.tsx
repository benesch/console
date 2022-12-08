import { Box, useColorModeValue, VStack } from "@chakra-ui/react";
import React from "react";

import TextLink from "~/components/TextLink";

const GetStartedDocs = () => {
  const bg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  return (
    <VStack spacing={2} alignItems="stretch">
      <Box p={4} borderRadius="lg" bg={bg}>
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
        <TextLink href="https://materialize.com/s/chat" target="_blank">
          Check out our community slack
        </TextLink>{" "}
        or{" "}
        <TextLink href="mailto:support@materialize.com">
          email support.
        </TextLink>
      </Box>
    </VStack>
  );
};

export default GetStartedDocs;
