/**
 * @module
 * Additional modal components, beyond those provided in Chakra UI.
 */

import {
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";

export interface ConfirmModalProps {
  /** The contents of the modal. */
  children: React.ReactNode;
  /** The color scheme for the open and confirm buttons. */
  colorScheme: string;
  /** The icon to use in the open and confirm buttons. */
  confirmIcon?: React.ReactElement;
  /** The text to use in the open and confirm buttons. */
  actionText: string;
  /** The text the user will be required to type to confirm the action. */
  confirmText: string;
  /** The callback to invoke if the user successfully confirms the action. */
  onConfirm: () => Promise<void>;
  /** The size of the open and confirm buttons. */
  size: string;
  /** The title of the modal. */
  title: string;
}

/**
 * A modal that requires typing a prompt in order to confirm an action.
 * Intended for use with dangerous actions, like destroying a deployment.
 */
export function ConfirmModal(props: ConfirmModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmation, setConfirmation] = useState("");
  const isConfirmed = confirmation === props.confirmText;
  const handleConfirm = async () => {
    await props.onConfirm();
    onClose();
  };

  return (
    <>
      <Button
        leftIcon={props.confirmIcon}
        colorScheme={props.colorScheme}
        onClick={onOpen}
        size={props.size}
      >
        {props.actionText}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{props.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="3" pb="6">
            <VStack align="left" spacing="4">
              {props.children}
              <Text fontSize="sm">
                Enter <strong>{props.confirmText}</strong> to proceed:
              </Text>
              <Input
                size="sm"
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme={props.colorScheme}
                isDisabled={!isConfirmed}
                onClick={handleConfirm}
              >
                {props.actionText}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
