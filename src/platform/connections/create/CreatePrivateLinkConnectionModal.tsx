import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import TextLink from "~/components/TextLink";
import ShieldIcon from "~/svg/ShieldIcon";
import { MaterializeTheme } from "~/theme";

export interface CreatePrivateLinkConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePrivateLinkConnectionModal = ({
  isOpen,
  onClose,
}: CreatePrivateLinkConnectionModalProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Modal variant="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody
          display="flex"
          flexDirection="column"
          alignItems="center"
          pt="16"
          px="10"
          pb="10"
        >
          <Box mb="6">
            <ShieldIcon />
          </Box>
          <Text textStyle="heading-md" mb="2">
            Configure AWS PrivateLink
          </Text>
          <Text
            color={semanticColors.foreground.secondary}
            as="p"
            width="386px"
            textAlign="center"
            mb="6"
          >
            Add the principal to your AWS console and accept the endpoint
            connection finish connecting.
          </Text>
          <Text
            as="p"
            backgroundColor={semanticColors.background.secondary}
            borderRadius="8px"
            p="4"
            mb="16"
          >
            Materialize does not yet support configuring PrivateLink via the web
            console. To do so, please connect via psql or your preferred tool
            and{" "}
            <TextLink
              href="https://materialize.com/docs/ingest-data/network-security/privatelink/"
              target="_blank"
            >
              follow the guide in our documentation
            </TextLink>
            . Once complete, return to this page.
          </Text>
          <Button variant="primary" width="100%" onClick={onClose}>
            I&apos;ve set up a PrivateLink connection
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreatePrivateLinkConnectionModal;
