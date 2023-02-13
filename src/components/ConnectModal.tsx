import {
  Box,
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import ConnectSteps from "~/platform/home/ConnectSteps";
import { MaterializeTheme } from "~/theme";
import useAppPasswords, {
  NEW_USER_DEFAULT_PASSWORD_NAME,
} from "~/useAppPasswords";

import { CopyableBox } from "./copyableComponents";
import SupportLink from "./SupportLink";
import TextLink from "./TextLink";

/**
 * A modal that displays Materialize connection instructions
 */
const ConnectModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <>
      <Button variant="secondary" size="sm" onClick={onOpen}>
        Connect
      </Button>

      <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontWeight="500">Connect To Materialize</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="2" pb="6" alignItems="stretch">
            <Text
              fontSize="sm"
              whiteSpace="normal"
              color={semanticColors.foreground.secondary}
            >
              Below are the details to connect to this database. If you need
              more information you can{" "}
              <TextLink href="https://materialize.com/docs/" target="_blank">
                view the documentation
              </TextLink>{" "}
              or <SupportLink variant="brandColor">Contact Support</SupportLink>
              .
            </Text>
            <ConnectSteps mt="4" />
            <Box mt="6">
              <CreateAppPassword />
            </Box>
            <Box
              mt="8"
              py="3"
              px="4"
              borderRadius="lg"
              background={semanticColors.background.secondary}
            >
              <Text fontSize="sm" color={semanticColors.foreground.secondary}>
                <TextLink
                  href="https://materialize.com/docs/get-started/"
                  target="_blank"
                >
                  Connect a streaming source
                </TextLink>{" "}
                and create your first materialized view in seconds.
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const CreateAppPassword = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const {
    addUserApiToken,
    loadingInProgress,
    createInProgress,
    tokensState,
    newPassword,
  } = useAppPasswords();

  if (loadingInProgress) {
    return (
      <Flex alignItems="center" color={semanticColors.foreground.secondary}>
        <Spinner size="sm" mr={2} /> Loading...
      </Flex>
    );
  }

  if (createInProgress) {
    return (
      <Flex alignItems="center" color={semanticColors.foreground.secondary}>
        <Spinner size="sm" mr={2} />
        <Text fontSize="sm">Generating new app password...</Text>
      </Flex>
    );
  }

  if (newPassword) {
    return (
      <>
        <VStack alignItems="stretch">
          <Text
            as="span"
            fontSize="sm"
            lineHeight="16px"
            fontWeight={500}
            color={semanticColors.foreground.primary}
          >
            New app password
          </Text>
          <CopyableBox contents={newPassword}>{newPassword}</CopyableBox>
        </VStack>
        <Text
          pt={1}
          fontSize="sm"
          lineHeight="20px"
          fontWeight={400}
          color={semanticColors.foreground.secondary}
        >
          Copy this app password to somewhere safe. App passwords cannot be
          displayed after initial creation.
        </Text>
      </>
    );
  }

  return (
    <>
      <HStack justifyContent="space-between">
        <Box>
          <Text fontSize="sm" fontWeight="500">
            Create an app password
          </Text>
          <Text fontSize="sm" color={semanticColors.foreground.secondary}>
            Create a new app password if you don’t have one accessible.
          </Text>
        </Box>
        <Button
          onClick={() =>
            addUserApiToken({
              description: `${NEW_USER_DEFAULT_PASSWORD_NAME} ${
                tokensState.apiTokensDataUser.length + 1
              }`,
            })
          }
          disabled={!!(tokensState.successDialog.secret || createInProgress)}
          variant="primary"
          size="sm"
        >
          Create app password
        </Button>
      </HStack>
    </>
  );
};

export default ConnectModal;
