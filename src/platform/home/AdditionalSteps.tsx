import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Code,
  Heading,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import CodeBlock from "../../components/CodeBlock";
import TextLink from "../../components/TextLink";

const AdditionalSteps = () => {
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
    p: 8,
    py: 4,
  };
  return (
    <VStack pb={2} mx={colorMode === "light" ? "-1px" : 0}>
      <Accordion
        allowMultiple
        width="100%"
        rounded="md"
        mt={2}
        variant="borderless"
      >
        <AccordionItem>
          {({ isExpanded }) => (
            <>
              <AccordionButton {...accordionButtonStyles(isExpanded)}>
                <Box flex="1" textAlign="left">
                  <Heading fontSize="lg" fontWeight="600">
                    Explore a streaming source
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel {...accordionPanelStyles}>
                <VStack spacing={8} alignItems="flex-start">
                  <VStack spacing={4} alignItems="flex-start">
                    <Heading fontSize="lg" fontWeight="600">
                      Create a source
                    </Heading>
                    <Text>
                      <Code>
                        <TextLink
                          href="https://materialize.com/docs/sql/create-source/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CREATE SOURCE
                        </TextLink>
                      </Code>{" "}
                      connects Materialize to your external data sources.
                    </Text>
                    <Text>
                      Here&apos;s how to add an example{" "}
                      <TextLink href="https://materialize.com/docs/sql/create-source/pubnub/">
                        PubNub source
                      </TextLink>{" "}
                      that connects to the market orders channel with a
                      subscribe key:
                      <CodeBlock
                        mt={1}
                        contents={
                          "CREATE SOURCE market_orders_raw" +
                          "\n" +
                          "FROM PUBNUB" +
                          "\n" +
                          "SUBSCRIBE KEY 'sub-c-abe5eda1-9123-4bad-bb39-4414d87b1966'" +
                          "\n" +
                          "CHANNEL 'pubnub-market-orders';"
                        }
                      />
                    </Text>
                    <Text>
                      The <Code>CREATE SOURCE</Code> statement is just a
                      definition of where to find and how to connect to our data
                      source. Materialize won&apos;t start ingesting data just
                      yet.
                    </Text>
                    <Text>
                      To list the columns created:
                      <CodeBlock
                        contents="SHOW COLUMNS IN market_orders_raw;"
                        mt={1}
                      />
                    </Text>
                    ---
                    <Code>
                      <TextLink
                        href="https://materialize.com/docs/sql/create-source/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        CREATE SOURCE
                      </TextLink>
                    </Code>{" "}
                    connects Materialize to your external data sources. Read
                    more about sources in our{" "}
                    <TextLink
                      href="https://materialize.com/docs/sql/create-source/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      docs
                    </TextLink>
                    . If you don&apos;t have a source ready, use ours:
                    <CodeBlock
                      contents={
                        "CREATE SOURCE market_orders_raw" +
                        "\n" +
                        "FROM PUBNUB" +
                        "\n" +
                        "SUBSCRIBE KEY 'sub-c-abe5eda1-9123-4bad-bb39-4414d87b1966'" +
                        "\n" +
                        "CHANNEL 'pubnub-market-orders';"
                      }
                    />{" "}
                    <br />
                    Check out your new source object with these{" "}
                    <Code>SHOW</Code> commands: <br />
                    <CodeBlock
                      contents={
                        "SHOW SOURCES;\nSHOW COLUMNS IN market_orders_raw;"
                      }
                    />
                  </VStack>

                  <VStack spacing={4} alignItems="flex-start">
                    <Heading fontSize="lg" fontWeight="600">
                      Create your views
                    </Heading>
                    <Code>
                      <TextLink
                        href="https://materialize.com/docs/sql/create-view/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        CREATE VIEW
                      </TextLink>
                    </Code>{" "}
                    creates a non-materialized view. If you&apos;ve created the
                    sample cource, try creating the following view:{" "}
                    <CodeBlock
                      contents={
                        "CREATE VIEW market_orders AS" +
                        "\n" +
                        "SELECT" +
                        "\n\t" +
                        "((text::jsonb)->>'bid_price')::float AS bid_price," +
                        "\n\t" +
                        "(text::jsonb)->>'order_quantity' AS order_quantity," +
                        "\n\t" +
                        "(text::jsonb)->>'symbol' AS symbol," +
                        "\n\t" +
                        "(text::jsonb)->>'trade_type' AS trade_type," +
                        "\n\t" +
                        "to_timestamp(((text::jsonb)->'timestamp')::bigint) AS ts" +
                        "\n" +
                        "FROM market_orders_raw;"
                      }
                    />
                  </VStack>
                  <VStack spacing={4} alignItems="flex-start">
                    <Heading fontSize="lg" fontWeight="600">
                      Create your materialized views
                    </Heading>
                    <Code>
                      <TextLink
                        href="https://materialize.com/docs/sql/create-materialized-view/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        CREATE MATERIALIZED VIEWS
                      </TextLink>
                    </Code>{" "}
                    lets you retrieve incrementally updated results of a SELECT
                    query. If you&apos;ve created the sample market data source
                    and view, try:
                    <CodeBlock
                      contents={
                        "CREATE MATERIALIZED VIEW avg_bid AS" +
                        "\n" +
                        "SELECT" +
                        "\n\t" +
                        "symbol," +
                        "\n\t" +
                        "AVG(bid_price) AS avg" +
                        "\n\t" +
                        "FROM market_orders" +
                        "\n\t" +
                        "GROUP BY symbol;"
                      }
                    />
                  </VStack>
                  <VStack spacing={4} alignItems="flex-start">
                    <Heading fontSize="lg" fontWeight="600">
                      Use your data
                    </Heading>
                    <ul>
                      <li>
                        <TextLink
                          href="https://materialize.com/docs/sql/select/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          SELECT
                        </TextLink>
                        &nbsp;queries materialized views, materialized sources
                        and tables.
                        <CodeBlock contents="SELECT * FROM avg_bid LIMIT 5;" />
                        <br />
                      </li>
                      <li>
                        <TextLink
                          href="https://materialize.com/docs/sql/tail/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          TAIL
                        </TextLink>
                        &nbsp;streams updates from a source, table, or view as
                        they occur.
                        <CodeBlock contents="COPY( TAIL (SELECT * FROM avg_bid) ) TO STDOUT;" />
                        <br />
                      </li>
                      <li>
                        <TextLink
                          href="https://materialize.com/docs/sql/create-sink/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          SINK
                        </TextLink>
                        &nbsp;sends data from Materialize to an external sink
                        <CodeBlock
                          contents={
                            "CREATE SINK market_data_sink" +
                            "\n" +
                            "FROM market_orders" +
                            "\n" +
                            "INTO KAFKA BROKER 'self-hosted-kafka' TOPIC 'quotes-sink'" +
                            "\n" +
                            "FORMAT JSON;"
                          }
                        />
                      </li>
                    </ul>
                  </VStack>
                </VStack>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </VStack>
  );
};

export default AdditionalSteps;
