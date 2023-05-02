import { Box, VStack } from "@chakra-ui/react";
import React from "react";

import { SUPPORT_HREF } from "~/components/SupportLink";
import TextLink from "~/components/TextLink";

const GetStartedDocs = () => {
  return (
    <VStack spacing={2} alignItems="stretch">
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
