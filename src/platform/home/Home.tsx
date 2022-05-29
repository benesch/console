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
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import TextLink from "../../components/TextLink";
import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import ConnectButton from "../dashboard/Connect";
import ConnectSteps from "../dashboard/ConnectSteps";

const Dashboard = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const grayText = useColorModeValue("gray.600", "gray.200");
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
            <PageHeading>Platform</PageHeading>
            <Text fontSize="md" textColor={grayText}>
              {current
                ? `${current?.provider}/${current?.region}`
                : "No region active"}
            </Text>
          </VStack>
          <Spacer />
        </HStack>
      </PageHeader>
      <VStack pb={6}>
        <Accordion
          defaultIndex={[0]}
          allowMultiple
          width={"100%"}
          background={"gray.500"}
          rounded="md"
        >
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                1. Connect to Materialize
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel py={8} background={"gray.600"}>
              <ConnectSteps />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                2. Create your sources
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} background={"gray.600"}>
              <Code>CREATE SOURCE</Code> connects Materialize to your external
              data sources. Read more about sources in our{" "}
              <TextLink href="https://materialize.com/docs/sql/create-source/">
                docs
              </TextLink>
              . If you don&apos;t have a source ready, use ours:
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                3. Create your views
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} background={"gray.600"}>
              <Code>CREATE VIEW</Code> does X. (dock) If you&apos;ve created the
              sample cource, try creating the following view:
              <Code>CREATE VIEW ...</Code>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                4. Create your materialized views
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} background={"gray.600"}>
              <Code>CREATE MATERIALIZED VIEWS</Code> does Y (docs). If
              you&apos;ve created the sample marleet data Lource and view, try:
              <Code>CREATE MATERIALIZED VIEW ...</Code>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                5. User your data
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel
              pb={4}
              background={"gray.600"}
              rounded="md"
              roundedTop={"none"}
            >
              <li>Select</li>
              <li>Tail</li>
              <li>Sink</li>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </>
  );
};

export default Dashboard;
