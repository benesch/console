import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import { Button, HStack } from "@chakra-ui/react";
import React, { useRef } from "react";

import { useCloudProvidersList } from "../../api/backend";
import { EmptyList } from "../../layouts/listPageComponents";
import EnvironmentTable from "./EnvironmentTable";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EnvironmentListModal = (props: Props): JSX.Element => {
  const { isOpen, onClose } = props;
  const initialFocusRef = useRef(null);
  const { data: regions } = useCloudProvidersList({});
  const isLoading = regions === null;
  const isEmpty = !isLoading && regions.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialFocusRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enable your region</ModalHeader>
        <ModalCloseButton />
        <ModalBody pt="3" pb="6">
          <Box ref={initialFocusRef} tabIndex={-1} />
          {/* <Text fontSize="3xl" fontWeight={700}>
            Welcome to Materialize!
          </Text> */}
          {/* <Text>
            To get started, please enable your first <a href="">region</a>
          </Text> */}
          {isLoading && <Spinner data-testid="loading-spinner" />}
          {isEmpty && <EmptyList title="available regions" />}
          {!isLoading && !isEmpty && <EnvironmentTable regions={regions} />}
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button size="sm" onClick={onClose} variant="outline">
              Close
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnvironmentListModal;
