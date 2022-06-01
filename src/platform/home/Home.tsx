import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Code,
  HStack,
  Spacer,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { Card, CardHeader } from "../../components/cardComponents";
import TextLink from "../../components/TextLink";
import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import ConnectSteps from "../dashboard/ConnectSteps";

const Home = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const grayText = useColorModeValue("gray.600", "gray.200");
  const expandedBg = useColorModeValue("purple.50", "pink.800");
  const expandedBgHover = useColorModeValue("purple.100", "pink.900");
  const { colorMode } = useColorMode();

  const accordionButtonStyles = (isExpanded: boolean) => ({
    backgroundColor: isExpanded ? expandedBg : "transparent",
    sx: {
      ":hover": {
        backgroundColor: isExpanded ? expandedBgHover : "default",
      },
    },
  });
  const accordionPanelStyles = {
    px: 12,
    py: 4,
  };
  return (
    <>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack
          spacing={4}
          alignItems="center"
          justifyContent="flex-start"
          width="100%"
        >
          <VStack alignItems="flex-start">
            <PageHeading>Welcome to Materialize</PageHeading>
            <Text fontSize="md" textColor={grayText}>
              Region:{" "}
              {current
                ? `${current?.provider}/${current?.region}`
                : "No region active"}
            </Text>
          </VStack>
          <Spacer />
        </HStack>
      </PageHeader>
      <Card>
        <CardHeader>Get started</CardHeader>
        <VStack pb={2} mx={colorMode === "light" ? "-1px" : 0}>
          <Accordion
            defaultIndex={[0]}
            allowMultiple
            width="100%"
            rounded="md"
            mt="-1px"
          >
            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <AccordionButton {...accordionButtonStyles(isExpanded)}>
                    <Box flex="1" textAlign="left">
                      1. Connect to Materialize
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel {...accordionPanelStyles}>
                    <ConnectSteps />
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <AccordionButton {...accordionButtonStyles(isExpanded)}>
                    <Box flex="1" textAlign="left">
                      2. Create your sources
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel {...accordionPanelStyles}>
                    <Code>CREATE SOURCE</Code> connects Materialize to your
                    external data sources. Read more about sources in our{" "}
                    <TextLink href="https://materialize.com/docs/sql/create-source/">
                      docs
                    </TextLink>
                    . If you don&apos;t have a source ready, use ours:
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <AccordionButton {...accordionButtonStyles(isExpanded)}>
                    <Box flex="1" textAlign="left">
                      3. Create your views
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel {...accordionPanelStyles}>
                    <Code>CREATE VIEW</Code> does X. (dock) If you&apos;ve
                    created the sample cource, try creating the following view:{" "}
                    <Code>CREATE VIEW ...</Code>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <AccordionButton {...accordionButtonStyles(isExpanded)}>
                    <Box flex="1" textAlign="left">
                      4. Create your materialized views
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel {...accordionPanelStyles}>
                    <Code>CREATE MATERIALIZED VIEWS</Code> does Y (docs). If
                    you&apos;ve created the sample marleet data source and view,
                    try: <Code>CREATE MATERIALIZED VIEW ...</Code>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <AccordionButton {...accordionButtonStyles(isExpanded)}>
                    <Box flex="1" textAlign="left">
                      5. Use your data
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel {...accordionPanelStyles}>
                    <li>Select</li>
                    <li>Tail</li>
                    <li>Sink</li>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          </Accordion>
        </VStack>
      </Card>
    </>
  );
};

export default Home;
