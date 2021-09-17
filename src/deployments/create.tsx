/**
 * @module
 * Deployment creation modal.
 */

import { AddIcon } from "@chakra-ui/icons";
import {
  Alert,
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
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useRef } from "react";

import { DeploymentSizeEnum, useDeploymentsCreate } from "../api/api";
import { SelectField, SubmitButton, TextField } from "../components/form";
import { petname } from "../util";
import { DeploymentSizeField } from "./util";

interface CreateDeploymentButton extends ButtonProps {
  refetch: () => Promise<void>;
}

export function CreateDeploymentButton(props: CreateDeploymentButton) {
  const { refetch, ...buttonProps } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate: createDeployment } = useDeploymentsCreate({});
  const toast = useToast();
  const initialFocusRef = useRef(null);

  return (
    <>
      <Button
        leftIcon={<AddIcon />}
        colorScheme="purple"
        onClick={onOpen}
        {...buttonProps}
      >
        Create deployment
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
              name: petname(),
              size: "XS" as DeploymentSizeEnum,
            }}
            onSubmit={async (values, actions) => {
              try {
                await createDeployment({
                  name: values.name,
                  size: values.size,
                });
                await refetch();
                onClose();
                toast({
                  title: "Deployment created.",
                  status: "success",
                });
              } catch (e: any) {
                if (e.status === 400) {
                  actions.setErrors(e.data);
                }
              }
            }}
          >
            <Form>
              <ModalHeader>Create deployment</ModalHeader>
              <ModalCloseButton />
              <ModalBody pt="3" pb="6">
                <Box ref={initialFocusRef} tabIndex={-1} />
                <VStack spacing="5">
                  <TextField name="name" label="Name" size="sm" />
                  <DeploymentSizeField />
                  <HStack width="100%">
                    <SelectField
                      name="cloud-provider"
                      label="Cloud provider"
                      size="sm"
                      disabled
                    >
                      <option>AWS</option>
                    </SelectField>
                    <SelectField
                      name="cloud-provider"
                      label="Region"
                      size="sm"
                      disabled
                    >
                      <option>us-east-1</option>
                    </SelectField>
                  </HStack>
                  <Alert status="info" fontSize="sm">
                    Additional cloud providers and regions coming soon.
                  </Alert>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <HStack>
                  <Button size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <SubmitButton size="sm">Create</SubmitButton>
                </HStack>
              </ModalFooter>
            </Form>
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
}
