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
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";

import { SubmitButton, TextField } from "../../../../components/form";
import { useDeployment } from "../../DeploymentProvider";
import { useTailscaleConfigurationForm } from "./hooks";

export const EnableEditTailscaleConfiguration: React.FC = (props) => {
  const { deployment } = useDeployment();

  const { modalState, save, defaultValues } = useTailscaleConfigurationForm();
  return (
    <>
      <Button size="sm" onClick={modalState.onOpen}>
        {deployment?.enableTailscale ? "Edit" : "Enable"}
      </Button>

      <Modal isOpen={modalState.isOpen} onClose={modalState.onClose} size="xl">
        <ModalOverlay />
        <ModalContent p={4}>
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
