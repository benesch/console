import { UseDisclosureReturn } from "@chakra-ui/hooks";
import { Modal } from "@chakra-ui/modal";
import {
  Button,
  HStack,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";

import { SubmitButton, TextField } from "../../../../components/form";
import { useDeployment } from "../../DeploymentProvider";
import { useTailscaleIntegration } from "./hooks";

export const EnableEditTailscaleConfiguration: React.FC = () => {
  const { deployment } = useDeployment();
  const { modalState, save, defaultValues } = useTailscaleIntegration();
  return (
    <>
      <EnableEditTailscaleButton
        onOpen={modalState.onOpen}
        isEnabled={deployment?.enableTailscale ?? false}
      />
      <Modal isOpen={modalState.isOpen} onClose={modalState.onClose} size="xl">
        <ModalOverlay />
        <ModalContent p={4} data-testid="tailscale-configuration-modal">
          <Formik
            initialValues={defaultValues}
            onSubmit={(values) => save(values)}
          >
            <Form>
              <ModalHeader>Configure Tailscale</ModalHeader>
              <ModalCloseButton />

              <Text color="gray.400">Required information</Text>
              <TextField
                name="tailscaleAuthKey"
                label="Tailscale Auth Key"
              ></TextField>
              <ModalFooter>
                <HStack flex="1">
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
