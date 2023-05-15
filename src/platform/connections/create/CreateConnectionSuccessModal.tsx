import {
  Button,
  Circle,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useRegionSlug } from "~/region";
import ConnectionIcon from "~/svg/ConnectionIcon";
import { MaterializeTheme } from "~/theme";

// semanticColors.accent.green with 0.12 opacity
const SEMANTIC_GREEN_WITH_OPACITY = "rgba(7, 164, 74, 0.12)";

const CreateConnectionSuccessModal = () => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [queryParams] = useSearchParams();
  const regionSlug = useRegionSlug();
  const navigate = useNavigate();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  function handleClose() {
    onClose();
    navigate("..");
  }

  const connectionType = queryParams.get("connectionType");
  const connectionId = queryParams.get("connectionId");

  if (!connectionType || !connectionId) {
    return null;
  }

  return (
    <Modal size="sm" isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <HStack height="14">
          <ModalCloseButton />
        </HStack>
        <ModalBody pt="4" pb="6">
          <VStack align="stretch" spacing="14">
            <VStack spacing="6">
              <Circle p={3} bg={SEMANTIC_GREEN_WITH_OPACITY}>
                <ConnectionIcon
                  color={semanticColors.accent.green}
                  height="8"
                  width="8"
                />
              </Circle>
              <VStack align="left" spacing="2" textAlign="center">
                <Text
                  textStyle="heading-md"
                  color={semanticColors.foreground.primary}
                >
                  New connection created
                </Text>
                <Text
                  textStyle="text-base"
                  color={semanticColors.foreground.secondary}
                >
                  Create a source from this connection and start streaming data
                  into Materialize.
                </Text>
              </VStack>
            </VStack>

            <Button
              as={Link}
              variant="primary"
              size="sm"
              to={`/regions/${regionSlug}/sources/new/${connectionType}?connectionId=${connectionId}`}
              height="10"
            >
              Create a data source
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateConnectionSuccessModal;
