import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  Link,
  LinkBox,
  LinkOverlay,
  Spacer,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import CodeBlock from "../../components/CodeBlock";
import TextLink from "../../components/TextLink";
import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import EnvironmentSelectField from "../../layouts/EnvironmentSelect";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import ConnectSteps from "./ConnectSteps";
import useEnvironmentState from "./useEnvironmentState";

const Home = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const { state: environmentState } = useEnvironmentState(
    current?.environmentControllerUrl
  );
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

  console.log(environmentState);

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
      {environmentState === "Enabled" && (
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
                      <Code>
                        <TextLink
                          href="https://materialize.com/docs/sql/create-view/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CREATE VIEW
                        </TextLink>
                      </Code>{" "}
                      creates a non-materialized view. If you&apos;ve created
                      the sample cource, try creating the following view:{" "}
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
                      <Code>
                        <TextLink
                          href="https://materialize.com/docs/sql/create-materialized-view/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CREATE MATERIALIZED VIEWS
                        </TextLink>
                      </Code>{" "}
                      lets you retrieve incrementally updated results of a
                      SELECT query. If you&apos;ve created the sample market
                      data source and view, try:
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
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            </Accordion>
          </VStack>
        </Card>
      )}
      {environmentState === "Not enabled" && (
        <Box textAlign="center">
          <EnvironmentSelectField size="lg" margin="auto" />
        </Box>
      )}
      {(environmentState === "Loading" || environmentState === "Starting") && (
        <Flex flexFlow="column">
          <Alert
            status="info"
            rounded="md"
            width="fit-content"
            px={4}
            margin="auto"
            marginTop={14}
          >
            <AlertIcon />
            Deployments can take a few minutes. In the meantime follow the next
            steps!
          </Alert>
          <Box py={20} margin="auto" width="100%">
            <Flex flexFlow="row">
              <Card>
                <LinkBox as="article">
                  <LinkOverlay href="/access">
                    <CardHeader>1. Create a password</CardHeader>
                    <CardContent>
                      Passwords are now available! Press here to generate one
                    </CardContent>
                  </LinkOverlay>
                </LinkBox>
              </Card>
              <Card marginLeft={10}>
                <LinkBox as="article">
                  <LinkOverlay href="https://materialize.com/docs/quickstarts/">
                    <CardHeader>2. Check our quickstarts</CardHeader>
                    <CardContent>
                      Our demos can help you turn your idea into something real
                      faster!
                    </CardContent>
                  </LinkOverlay>
                </LinkBox>
              </Card>
              <Card marginLeft={10}>
                <LinkBox as="article">
                  <LinkOverlay href="https://materialize.com/blog">
                    <CardHeader>3. Check our latests blogs</CardHeader>
                    <CardContent>
                      Stay up to date with our latest updates and releases!
                    </CardContent>
                  </LinkOverlay>
                </LinkBox>
              </Card>
            </Flex>
          </Box>

          <Flex textAlign="center" alignItems="center" margin="auto">
            Looking for help?
            <LinkBox
              width="fit-content"
              display="flex"
              padding={4}
              rounded="md"
              as="button"
              bottom={0}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.31717 13.238C4.31717 14.4012 3.37517 15.3432 2.21199 15.3432C1.04881 15.3432 0.106812 14.4012 0.106812 13.238C0.106812 12.0748 1.04881 11.1328 2.21199 11.1328H4.31717V13.238Z"></path>
                <path d="M5.37042 13.238C5.37042 12.0748 6.31242 11.1328 7.4756 11.1328C8.63878 11.1328 9.58078 12.0748 9.58078 13.238V18.5017C9.58078 19.6649 8.63878 20.6069 7.4756 20.6069C6.31242 20.6069 5.37042 19.6649 5.37042 18.5017V13.238Z"></path>
                <path d="M7.4756 4.81729C6.31242 4.81729 5.37042 3.87529 5.37042 2.71211C5.37042 1.54893 6.31242 0.606934 7.4756 0.606934C8.63878 0.606934 9.58078 1.54893 9.58078 2.71211V4.81729H7.4756Z"></path>
                <path d="M7.47574 5.87061C8.63891 5.87061 9.58091 6.81261 9.58091 7.97578C9.58091 9.13896 8.63891 10.081 7.47574 10.081H2.21199C1.04881 10.081 0.106812 9.13737 0.106812 7.97578C0.106812 6.8142 1.04881 5.87061 2.21199 5.87061H7.47574Z"></path>
                <path d="M15.8955 7.97578C15.8955 6.81261 16.8375 5.87061 18.0007 5.87061C19.1639 5.87061 20.1059 6.81261 20.1059 7.97578C20.1059 9.13896 19.1639 10.081 18.0007 10.081H15.8955V7.97578Z"></path>
                <path d="M14.8423 7.97586C14.8423 9.13904 13.9003 10.081 12.7372 10.081C11.574 10.081 10.632 9.13904 10.632 7.97586V2.71211C10.632 1.54893 11.574 0.606934 12.7372 0.606934C13.9003 0.606934 14.8423 1.54893 14.8423 2.71211V7.97586Z"></path>
                <path d="M12.7371 16.3967C13.9003 16.3967 14.8423 17.3387 14.8423 18.5019C14.8423 19.6651 13.9003 20.6071 12.7371 20.6071C11.574 20.6071 10.632 19.6651 10.632 18.5019V16.3967H12.7371Z"></path>
                <path d="M12.7372 15.3432C11.574 15.3432 10.632 14.4012 10.632 13.238C10.632 12.0748 11.574 11.1328 12.7372 11.1328H18.0009C19.1641 11.1328 20.1061 12.0748 20.1061 13.238C20.1061 14.4012 19.1641 15.3432 18.0009 15.3432H12.7372Z"></path>
              </svg>
              <Text className="inline-on-desktop" marginLeft={1}>
                <b>Join the Community</b>
              </Text>
            </LinkBox>
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default Home;
