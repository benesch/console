import { UseDisclosureReturn } from "@chakra-ui/hooks";
import { Modal, ModalBody } from "@chakra-ui/modal";
import {
  Button,
  HStack,
  Link,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";

import { SubmitButton, TextField } from "../../../../components/form";
import { DeploymentIntegrationCallToActionProps } from "../types";
import { useTailscaleIntegration } from "./hooks";

export const EnableEditTailscaleConfiguration: React.FC<DeploymentIntegrationCallToActionProps> =
  (props) => {
    const { modalState, save, defaultValues } = useTailscaleIntegration(props);

    return (
      <>
        <EnableEditTailscaleButton
          onOpen={modalState.onOpen}
          isEnabled={props.enabled}
        />
        <Modal isOpen={modalState.isOpen} onClose={modalState.onClose}>
          <ModalOverlay />
          <ModalContent data-testid="tailscale-configuration-modal">
            <Formik
              initialValues={defaultValues}
              onSubmit={(values) => save(values)}
            >
              <Form>
                <ModalHeader flexGrow={1}>Configure Tailscale</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack>
                    <TextField
                      type="password"
                      name="tailscaleAuthKey"
                      label="Tailscale Auth Key"
                    ></TextField>
                    <Text fontSize="sm">
                      See the{" "}
                      <Link
                        href="https://tailscale.com/kb/1085/auth-keys/"
                        textDecoration="underline"
                      >
                        official documentation
                      </Link>{" "}
                      to learn how to generate a pre-authentication key.
                    </Text>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <Button onClick={modalState.onClose} size="sm">
                      Cancel
                    </Button>
                    <SubmitButton size="sm">Save</SubmitButton>
                  </HStack>
                </ModalFooter>
              </Form>
            </Formik>
          </ModalContent>
        </Modal>
      </>
    );
  };

export const EnableEditTailscaleButton: React.FC<{
  onOpen: () => void;
  isEnabled: boolean;
}> = ({ onOpen, isEnabled }) => {
  const isEnabledText = isEnabled ? "Edit" : "Enable";
  const colorScheme = isEnabled ? undefined : "purple";
  return (
    <Button size="sm" onClick={onOpen} colorScheme={colorScheme}>
      {isEnabledText}
    </Button>
  );
};
