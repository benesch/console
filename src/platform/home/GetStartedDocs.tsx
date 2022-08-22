import { Box, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import React from "react";

import TextLink from "../../components/TextLink";
import { semanticColors } from "../../theme/colors";

const GetStartedDocs = () => {
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );
  return (
    <VStack
      alignItems="stretch"
      spacing={2}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
    >
      <HStack p={4} py={2} borderBottom="1px" borderColor={borderColor}>
        <Text flex={1} fontWeight="500" fontSize="md">
          Get started guide
        </Text>
      </HStack>
      <Box p={4} pt={2}>
        <TextLink
          href="https://materialize.com/docs/unstable/get-started/"
          target="_blank"
        >
          Connect a streaming source
        </TextLink>{" "}
        and create your first materialized view in seconds.
      </Box>
    </VStack>
  );
};

export default GetStartedDocs;
