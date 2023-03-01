import {
  Box,
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
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { useController, useForm } from "react-hook-form";

import { getCurrentStack, getFronteggUrl } from "~/config";
import { NAV_HORIZONTAL_SPACING, NAV_HOVER_STYLES } from "~/layouts/NavBar";
import storageAvailable from "~/utils/storageAvailable";

const setStack = (stackName: string) => {
  if (storageAvailable("localStorage")) {
    window.localStorage.setItem("mz-current-stack", stackName);
  }
};

const getStackName = (data: {
  stackName: string;
  personalStackName: string;
}) => {
  if (data.stackName === "personal") {
    return data.personalStackName;
  }
  return data.stackName;
};

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/**
 * A modal that allows switching which backend stack to use.
 */
const SwitchStackModal = () => {
  const flags = useFlags();
  const {
    control,
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    setError,
  } = useForm<{
    stackName: string;
    personalStackName: string;
  }>({
    mode: "onTouched",
  });
  // This is a work aroudn fro the Chakra RadioGroup onChange not providing an event parameter
  const { field: personalStackField } = useController({
    name: "stackName",
    control,
    rules: { required: "Please select a stack." },
  });
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      reset();
    },
  });

  if (!flags["switch-stacks-modal"]) return null;

  const isValidStack = async (stack: string) => {
    const baseUrl = getFronteggUrl(stack);
    try {
      const response = await fetch(
        baseUrl + "/frontegg/identity/resources/configurations/v1/public"
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  };

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

      <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form
          onSubmit={handleSubmit(async (data) => {
            console.log("handleSubmit");
            const isPersonal = data.stackName === "personal";
            if (isPersonal && !data.personalStackName) {
              setError("personalStackName", {
                type: "custom",
                message: "Please enter a personal stack name.",
              });
              return;
            }
            const name = getStackName(data);
            const valid = await isValidStack(name);
            if (valid) {
              setStack(name);
              location.reload();
            } else {
              setError(isPersonal ? "personalStackName" : "stackName", {
                type: "custom",
                message: `${getFronteggUrl(
                  name
                )} is not reachable from this origin.`,
              });
            }
          })}
        >
          <ModalContent>
            <ModalHeader fontWeight="500">Switch Stacks</ModalHeader>
            <ModalCloseButton />
            <ModalBody pt="2" pb="6" alignItems="stretch">
              <FormControl isInvalid={!!formState.errors.stackName}>
                <Text
                  color="semanticColors.foreground.secondary"
                  fontSize="sm"
                  my="4"
                >
                  Current Stack: {getCurrentStack()}
                </Text>
                <FormLabel htmlFor="stackName" fontSize="sm">
                  Stack Name
                </FormLabel>
                <RadioGroup {...register("stackName")} {...personalStackField}>
                  <Stack direction="column">
                    {!isLocalhost && (
                      <Radio value="production">Production</Radio>
                    )}
                    <Radio value="staging">Staging</Radio>
                    <Radio value="local">Local</Radio>
                    <Radio value="personal">Personal</Radio>
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>
                  {formState.errors.stackName?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formState.errors.personalStackName}>
                <Box ml="6" mt="2">
                  <Input
                    {...register("personalStackName")}
                    onFocus={() => setValue("stackName", "personal")}
                    placeholder="$USER.$ENV"
                    autoFocus={isOpen}
                    autoCorrect="off"
                    size="sm"
                  />
                  <FormErrorMessage>
                    {formState.errors.personalStackName?.message}
                  </FormErrorMessage>
                </Box>
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
