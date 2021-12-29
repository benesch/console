/**
 * @module
 * Deployment update modal.
 */

import { EditIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonProps,
  FormControl,
  FormHelperText,
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
import {
  SubmitButton,
  SwitchField,
  TextField,
} from "../components/formComponents";
import DeploymentSizeField from "./DeploymentSizeField";

interface EditDeploymentButtonProps extends ButtonProps {
  deployment: Deployment;
  refetch: () => Promise<void>;
}

function EditDeploymentModal({
  deployment,
  refetch,
  ...props
}: EditDeploymentButtonProps) {
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
        Edit
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={initialFocusRef}
      >
        <ModalOverlay />
        <ModalContent>
          <Formik
            initialValues={{
              name: deployment.name,
              size: deployment.size,
              disableUserIndexes: deployment.disableUserIndexes,
            }}
            onSubmit={async (values, actions) => {
              try {
                await updateDeployment({
                  name: values.name,
                  size: values.size,
                  disableUserIndexes: values.disableUserIndexes,
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
                <ModalHeader>Edit deployment</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt="3" pb="3">
                  <Box ref={initialFocusRef} tabIndex={-1} />
                  <VStack spacing="5">
                    <TextField name="name" label="Name" size="sm" />
                    <DeploymentSizeField />
                    <Accordion allowMultiple w="100%">
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            Advanced settings
                            <AccordionIcon />
                          </Box>
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <SwitchField
                            display="flex"
                            alignItems="center"
                            pt="1"
                            name="disableUserIndexes"
                            id="disableUserIndexes"
                            label="Disable user indexes"
                            fontSize="sm"
                            size="sm"
                          />
                          <FormControl>
                            <FormHelperText>
                              Use this mode to troubleshoot a Materialize
                              deployment that is running out of memory.
                            </FormHelperText>
                          </FormControl>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                    {(deployment.size !== form.values.size ||
                      deployment.disableUserIndexes !==
                        form.values.disableUserIndexes) && (
                      <Alert status="warning">
                        <AlertIcon />
                        <Text fontSize="sm" flex="1">
                          {`Changing your deployment's ${
                            deployment.size !== form.values.size ? "size" : ""
                          }${
                            deployment.size !== form.values.size &&
                            deployment.disableUserIndexes !==
                              form.values.disableUserIndexes
                              ? " and "
                              : ""
                          }${
                            deployment.disableUserIndexes !==
                            form.values.disableUserIndexes
                              ? "index mode"
                              : ""
                          } will restart your
                          deployment.`}
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <Button size="sm" onClick={onClose} variant="outline">
                      Cancel
                    </Button>
                    <SubmitButton size="sm">Save</SubmitButton>
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

export default EditDeploymentModal;
