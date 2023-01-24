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

import { CopyableBox } from "~/components/copyableComponents";
import Chevron from "~/svg/Chevron";
import { MaterializeTheme } from "~/theme";

const secrets = `CREATE SECRET broker_url AS "http://broker.com";
CREATE SECRET username AS "usernamegoeshere";
CREATE SECRET password AS "mypassword";
`;

const GettingStarted = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Box
      borderRadius="md"
      borderColor={semanticColors.border.info}
      borderWidth="1px"
      overflow="hidden"
    >
      <Box p="4" background={semanticColors.background.info}>
        <HStack spacing={10}>
          <VStack spacing="2" alignItems="start">
            <Heading as="h6" fontSize="sm" fontWeight="500">
              Get started with Materialize
            </Heading>
            <Text fontSize="sm" color={semanticColors.foreground.secondary}>
              Learn the basics of Materialize by creating your first set of
              cluster, views, and sources.
            </Text>
            <Button
              color={semanticColors.foreground.primary}
              fontSize="sm"
              fontWeight="normal"
              fontFamily="mono"
              _hover={{
                textDecoration: "none",
              }}
              variant="link"
              onClick={() => setExpanded((val) => !val)}
            >
              Demo credentials
              <Box ml={1}>
                <Chevron direction={expanded ? "up" : "down"} />
              </Box>
            </Button>
          </VStack>
          <Button
            as="a"
            target="_blank"
            rel="noopener"
            href="//materialize.com/docs/get-started/"
            variant="outline"
            size="sm"
            bg={semanticColors.background.primary}
          >
            Get started
          </Button>
        </HStack>
      </Box>
      {expanded && (
        <CopyableBox variant="embedded" contents={secrets}>
          {secrets}
        </CopyableBox>
      )}
    </Box>
  );
};

export default GettingStarted;
