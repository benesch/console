import { Flex, Grid, GridItem, Text, useTheme, VStack } from "@chakra-ui/react";
import React from "react";

import IconNavLink from "~/components/IconNavLink";
import TextLink from "~/components/TextLink";
import awsLogo from "~/img/aws-logo.svg";
import kafkaLogo from "~/img/kafka-logo.svg";
import postgresLogo from "~/img/postgres-logo.svg";
import terminalIcon from "~/img/terminal.svg";
import { MaterializeTheme } from "~/theme";

import InviteBox from "./InviteBox";

const ConnectionsCreateEntry = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Flex justifyContent="center">
      <VStack mt="20" width="460px" spacing="10" alignItems="stretch">
        <VStack alignItems="flex-start">
          <Text as="h1" textStyle="heading-xl">
            Let&apos;s create a connection
          </Text>
          <Text
            as="h2"
            textStyle="heading-xs"
            color={semanticColors.foreground.secondary}
          >
            Create once, and reuse across sources and sinks.
          </Text>
        </VStack>
        <VStack spacing="6" alignItems="stretch">
          <Text as="h3" textStyle="heading-xs">
            Data sources
          </Text>
          <Grid gridTemplateColumns="1fr 1fr" gridGap="4">
            <GridItem>
              <IconNavLink iconSource={kafkaLogo} width="100%" to="kafka">
                Apache Kafka
              </IconNavLink>
            </GridItem>
            <GridItem>
              <IconNavLink iconSource={postgresLogo} width="100%" to="postgres">
                Postgres
              </IconNavLink>
            </GridItem>
          </Grid>
        </VStack>
        <VStack spacing="6" alignItems="stretch">
          <Text as="h3" textStyle="heading-xs">
            Network Security
          </Text>
          <Grid gridTemplateColumns="1fr 1fr" gridGap="4">
            <GridItem>
              <IconNavLink iconSource={terminalIcon} width="100%" to="ssh">
                SSH Tunnel
              </IconNavLink>
            </GridItem>
            <GridItem>
              <IconNavLink iconSource={awsLogo} width="100%" to="aws">
                PrivateLink
              </IconNavLink>
            </GridItem>
          </Grid>
        </VStack>
        <Text textStyle="text-base" color={semanticColors.foreground.secondary}>
          Looking to connect somewhere else?{" "}
          <TextLink href="https://materialize.com/contact/" target="_blank">
            Let us know.
          </TextLink>
        </Text>
        <InviteBox alignItems="stretch" />
      </VStack>
    </Flex>
  );
};

export default ConnectionsCreateEntry;
