import {
  Flex,
  Grid,
  GridItem,
  Text,
  useDisclosure,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import segment from "~/analytics/segment";
import IconNavLink from "~/components/IconNavLink";
import TextLink from "~/components/TextLink";
import AwsLogoIcon from "~/svg/AwsLogoIcon";
import KafkaLogoIcon from "~/svg/KafkaLogoIcon";
import PostgresLogoIcon from "~/svg/PostgresLogoIcon";
import TerminalIcon from "~/svg/Terminal";
import { MaterializeTheme } from "~/theme";

import CreatePrivateLinkConnectionModal from "./CreatePrivateLinkConnectionModal";
import CreateSshConnectionModal from "./CreateSshConnectionModal";
import InviteBox from "./InviteBox";

const CreateConnectionEntry = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const {
    onOpen: openPrivateLinkModal,
    isOpen: isPrivateLinkModalOpen,
    onClose: closePrivateLinkModal,
  } = useDisclosure();
  const {
    onOpen: openSshModal,
    isOpen: isSshModalOpen,
    onClose: closeSshModal,
  } = useDisclosure();
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
              <IconNavLink
                icon={<KafkaLogoIcon width="6" height="6" />}
                width="100%"
                to="../kafka"
              >
                Apache Kafka
              </IconNavLink>
            </GridItem>
            <GridItem>
              <IconNavLink
                icon={<PostgresLogoIcon height="6" width="6" />}
                width="100%"
                to="../postgres"
              >
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
              <IconNavLink
                icon={<TerminalIcon width="6" height="6" />}
                width="100%"
                to="."
                onClick={() => {
                  openSshModal();
                  segment.track("Create SSH Connection Clicked");
                }}
              >
                SSH Tunnel
              </IconNavLink>
            </GridItem>
            <GridItem>
              <IconNavLink
                icon={<AwsLogoIcon height="6" width="6" />}
                width="100%"
                to="."
                onClick={() => {
                  openPrivateLinkModal();
                  segment.track("Create PrivateLink Connection Clicked");
                }}
              >
                PrivateLink
              </IconNavLink>
            </GridItem>
          </Grid>
        </VStack>
        <Text textStyle="text-base" color={semanticColors.foreground.secondary}>
          Looking to connect somewhere else?{" "}
          <TextLink
            href="https://materialize.com/docs/integrations/"
            target="_blank"
          >
            Let us know.
          </TextLink>
        </Text>
        <InviteBox alignItems="stretch" />
      </VStack>
      <CreatePrivateLinkConnectionModal
        isOpen={isPrivateLinkModalOpen}
        onClose={closePrivateLinkModal}
      />
      <CreateSshConnectionModal
        isOpen={isSshModalOpen}
        onClose={closeSshModal}
      />
    </Flex>
  );
};

export default CreateConnectionEntry;
