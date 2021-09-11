/**
 * @module
 * Deployment update modal.
 */

import { EditIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonProps,
  HStack,
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
import { Form, Formik } from "formik";
import React, { useRef } from "react";

import { Deployment, useDeploymentsPartialUpdate } from "../api/api";
import { SubmitButton, TextField } from "../components/form";
import { DeploymentSizeField } from "./util";

interface UpdateDeploymentButtonProps extends ButtonProps {
  deployment: Deployment;
  refetch: () => Promise<void>;
}

export function UpdateDeploymentButton({
  deployment,
  refetch,
  ...props
}: UpdateDeploymentButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate: updateDeployment } = useDeploymentsPartialUpdate({
    id: deployment.id,
  });
  const initialFocusRef = useRef(null);

  return (
    <>
      <Button
        leftIcon={<EditIcon />}
        colorScheme="purple"
        onClick={onOpen}
        {...props}
      >
        Update
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={initialFocusRef}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <Formik
            initialValues={{
              name: deployment.name,
              size: deployment.size,
            }}
            onSubmit={async (values, actions) => {
              try {
                await updateDeployment({
                  name: values.name,
                  size: values.size,
                });
                await refetch();
                onClose();
              } catch (e: any) {
                if (e.status === 400) {
                  actions.setErrors(e.data);
                }
              }
            }}
          >
            {(form) => (
              <Form>
                <ModalHeader>Update deployment</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt="3" pb="6">
                  <Box ref={initialFocusRef} tabindex="-1" />
                  <VStack spacing="5">
                    <TextField name="name" label="Name" size="sm" />
                    <DeploymentSizeField />
                    {deployment.size !== form.values.size && (
                      <Alert status="warning">
                        <AlertIcon />
                        <Text fontSize="sm" flex="1">
                          Changing your deployment's size will restart your
                          deployment.
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <Button size="sm" onClick={onClose}>
                      Cancel
                    </Button>
                    <SubmitButton size="sm">Update</SubmitButton>
                  </HStack>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
}
