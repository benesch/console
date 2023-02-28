import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { useForm } from "react-hook-form";

import { NAV_HORIZONTAL_SPACING, NAV_HOVER_STYLES } from "~/layouts/NavBar";
import storageAvailable from "~/utils/storageAvailable";

const setStack = (stackName: string) => {
  if (storageAvailable("localStorage")) {
    window.localStorage.setItem("mz-current-stack", stackName);
  }
};

/**
 * A modal that allows switching which backend stack to use.
 */
const SwitchStackModal = () => {
  const flags = useFlags();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, handleSubmit, formState, reset } = useForm<{
    stackName: string;
  }>({
    mode: "onTouched",
  });

  if (!flags["switch-stacks-modal"]) return null;

  return (
    <>
      <Button
        mx={NAV_HORIZONTAL_SPACING}
        variant="secondary"
        size="sm"
        fontWeight={500}
        color="semanticColors.foreground.primary"
        _hover={NAV_HOVER_STYLES}
        gap={NAV_HORIZONTAL_SPACING}
        height="auto"
        px={1}
        py={2}
        onClick={onOpen}
      >
        Switch stack
        <Tag
          fontSize={12}
          borderWidth="1px"
          borderColor="semanticColors.border.info"
          background="semanticColors.background.info"
          color="semanticColors.foreground.secondary"
        >
          Internal
        </Tag>
      </Button>

      <Modal
        size="3xl"
        isOpen={isOpen}
        onClose={() => {
          reset();
          onClose();
        }}
      >
        <ModalOverlay />
        <form
          onSubmit={handleSubmit((data) => {
            setStack(data.stackName);
            location.reload();
          })}
        >
          <ModalContent>
            <ModalHeader fontWeight="500">Switch Stacks</ModalHeader>
            <ModalCloseButton />
            <ModalBody pt="2" pb="6" alignItems="stretch">
              <FormControl isInvalid={!!formState.errors.stackName}>
                <FormLabel htmlFor="stackName" fontSize="sm">
                  Stack Origin
                </FormLabel>
                <Input
                  {...register("stackName", {
                    required: "Stack is required",
                  })}
                  placeholder="e.g. staging or $USER.dev for personal stacks"
                  autoFocus={isOpen}
                  autoCorrect="off"
                  size="sm"
                />
                <FormErrorMessage>
                  {formState.errors.stackName?.message}
                </FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <HStack spacing="2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Switch
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default SwitchStackModal;
