import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useRegionSlug } from "~/region";

const CreateConnectionSuccessModal = () => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [queryParams] = useSearchParams();
  const regionSlug = useRegionSlug();
  const navigate = useNavigate();

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
    <Modal size="md" isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader height="14">
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody pt="3" pb="6">
          <VStack align="left" spacing="4">
            <Text>New connection created</Text>

            <Button
              as={Link}
              variant="primary"
              size="sm"
              to={`/regions/${regionSlug}/sources/new/${connectionType}?connectionId=${connectionId}`}
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
