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
import * as Yup from "yup";

import { SubmitButton, TextField } from "../../../../components/form";
import { DeploymentIntegrationCallToActionProps } from "../types";
import { useTailscaleIntegration } from "./hooks";
import { UpdateIntegrationError } from "./UpdateIntegrationError";

const validationSchema = Yup.object().shape({
  tailscaleAuthKey: Yup.string().required("Required"),
});

export const EnableEditTailscaleConfiguration: React.FC<DeploymentIntegrationCallToActionProps> =
  (props) => {
    const { modalState, save, defaultValues, operation } =
      useTailscaleIntegration(props);

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
              validationSchema={validationSchema}
              onSubmit={(values) => save(values)}
            >
              <Form>
                <ModalHeader flexGrow={1}>Configure Tailscale</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack>
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
                          target="_blank"
                          textDecoration="underline"
                        >
                          Tailscale documentation
                        </Link>{" "}
                        to learn how to generate a pre-authentication key.
                      </Text>
                    </VStack>
                    {operation.error && (
                      <UpdateIntegrationError name="Tailscale" />
                    )}
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <Button
                      onClick={modalState.onClose}
                      size="sm"
                      disabled={operation.loading}
                    >
                      Cancel
                    </Button>
                    <SubmitButton size="sm" disabled={operation.loading}>
                      Save
                    </SubmitButton>
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
