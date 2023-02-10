import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import ConnectSteps from "~/platform/home/ConnectSteps";
import { MaterializeTheme } from "~/theme";

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

      <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontWeight="500">Connect To Materialize</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="2" pb="6" alignItems="stretch">
            <Text fontSize="sm">
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
              <HStack justifyContent="space-between">
                <Box>
                  <Text fontSize="sm" fontWeight="500">
                    Create an app password
                  </Text>
                  <Text
                    fontSize="sm"
                    color={semanticColors.foreground.secondary}
                  >
                    Create a new app password if you don’t have one accessible.
                  </Text>
                </Box>
                <Button as="a" href="/access" variant="primary" size="sm">
                  Create app password
                </Button>
              </HStack>
            </Box>
            <Box
              mt="8"
              py="3"
              px="4"
              borderRadius="lg"
              background={semanticColors.background.secondary}
            >
              <Text fontSize="xs">
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

export default ConnectModal;
