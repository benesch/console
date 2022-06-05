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
import CodeBlock from "../../components/CodeBlock";
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
                    <TextLink href="https://materialize.com/docs/sql/create-source/" target="_blank" rel="noopener noreferrer">
                      docs
                    </TextLink>
                    . If you don&apos;t have a source ready, use ours:
                    <CodeBlock
                      contents={"CREATE SOURCE market_orders_raw" +"\n" +
                                "FROM PUBNUB" + "\n" +
                                "SUBSCRIBE KEY 'sub-c-4377ab04-f100-11e3-bffd-02ee2ddab7fe'" + "\n" +
                                "CHANNEL 'pubnub-market-orders';"
                      }
                    /> <br/>
                    Check out your new source object with these <Code>SHOW</Code> commands: <br/>
                    <CodeBlock
                      contents={"SHOW SOURCES;\nSHOW COLUMNS IN market_orders_raw;"}
                    />
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
                  <Code><TextLink href="https://materialize.com/docs/sql/create-view/" target="_blank" rel="noopener noreferrer">CREATE VIEW</TextLink></Code> creates a non-materialized view. If you&apos;ve
                    created the sample cource, try creating the following view:{" "}
                    <CodeBlock
                      contents={"CREATE VIEW market_orders AS" + "\n" +
                      "SELECT" + "\n\t" +
                          "((text::jsonb)->>'bid_price')::float AS bid_price," + "\n\t" +
                          "(text::jsonb)->>'order_quantity' AS order_quantity," + "\n\t" +
                          "(text::jsonb)->>'symbol' AS symbol," + "\n\t" +
                          "(text::jsonb)->>'trade_type' AS trade_type," + "\n\t" +
                          "to_timestamp(((text::jsonb)->'timestamp')::bigint) AS ts" + "\n" +
                      "FROM market_orders_raw;"}
                    />
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
                    <Code><TextLink href="https://materialize.com/docs/sql/create-materialized-view/" target="_blank" rel="noopener noreferrer">CREATE MATERIALIZED VIEWS</TextLink></Code> lets you retrieve incrementally updated results of a SELECT query. If
                    you&apos;ve created the sample market data source and view,
                    try:
                    <CodeBlock contents={
                    "CREATE MATERIALIZED VIEW avg_bid AS" + "\n" +
                    "SELECT" + "\n\t" +
                      "symbol," + "\n\t" +
                      "AVG(bid_price) AS avg" + "\n\t" +
                      "FROM market_orders" + "\n\t" +
                      "GROUP BY symbol;"
                    } />
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
                    <ul>
                    <li>
                      <TextLink href="https://materialize.com/docs/sql/select/" target="_blank" rel="noopener noreferrer">SELECT</TextLink>
                      &nbsp;queries materialized views, materialized sources and tables.
                      <CodeBlock contents="SELECT * FROM avg_bid LIMIT 5;" />
                      <br/>
                    </li>
                    <li>
                      <TextLink href="https://materialize.com/docs/sql/tail/" target="_blank" rel="noopener noreferrer">TAIL</TextLink>
                      &nbsp;streams updates from a source, table, or view as they occur.
                      <CodeBlock contents="COPY( TAIL (SELECT * FROM avg_bid) ) TO STDOUT;" />
                      <br/>
                    </li>
                    <li>
                      <TextLink href="https://materialize.com/docs/sql/create-sink/" target="_blank" rel="noopener noreferrer">SINK</TextLink>
                      &nbsp;sends data from Materialize to an external sink
                      <CodeBlock contents={"CREATE SINK market_data_sink" + "\n" +
                                            "FROM market_orders" + "\n" +
                                            "INTO KAFKA BROKER 'self-hosted-kafka' TOPIC 'quotes-sink'" + "\n" +
                                            "FORMAT JSON;"}
                      />
                    </li>
                    </ul>
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
