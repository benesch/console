import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useRef } from "react";

import { useCloudProvidersList } from "../../api/backend";
import { EmptyList } from "../../layouts/listPageComponents";
import EnvironmentTable from "./EnvironmentTable";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isWelcome?: boolean;
}

const EnvironmentListModal = (props: Props): JSX.Element => {
  const { isOpen, onClose, isWelcome } = props;
  const initialFocusRef = useRef(null);
  const { data: regions } = useCloudProvidersList({});
  const isLoading = regions === null;
  const isEmpty = !isLoading && regions.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={initialFocusRef}
      size="3xl"
    >
      <ModalOverlay />
      <ModalContent>
        {!isWelcome && (
          <>
            <ModalHeader>Regions</ModalHeader>
            <ModalCloseButton />
          </>
        )}
        <ModalCloseButton />
        <ModalBody pt="3" pb="6">
          <Box ref={initialFocusRef} tabIndex={-1} />
          {isWelcome && (
            <VStack mb={4} spacing={2} alignItems="flex-start">
              <Text fontSize="2xl" fontWeight={700}>
                Welcome to Materialize!
              </Text>
              <Text>To get started, please enable your first region:</Text>
            </VStack>
          )}
          {isLoading && <Spinner data-testid="loading-spinner" />}
          {isEmpty && <EmptyList title="available regions" />}
          {!isLoading && !isEmpty && (
            <Box mx={-6}>
              <EnvironmentTable regions={regions} />
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EnvironmentListModal;
