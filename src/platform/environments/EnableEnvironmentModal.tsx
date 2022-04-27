/**
 * @module
 * Enable environment modal.
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
  Spinner,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useRef } from "react";

import { useAuth } from "../../api/auth";
import {
  Deployment,
  SupportedCloudRegion,
  useCloudProvidersList,
} from "../../api/backend";
import { EnvironmentRequest } from "../../api/environment-controller";
import { SubmitButton, TextField } from "../../components/formComponents";

interface Props extends ButtonProps {
  refetch: () => Promise<any>;
  region: SupportedCloudRegion;
}

/// The image SHA that we spin up all new materialize platform
/// components up with by default.  You need to bump this to a new
/// value whenever you wish to try new materialized functions in
/// cloud.
// TODO: Use something like the release tracks we use for materialize cloud deployments.
const ImageTag = "unstable-ed7b39a4d357ace3fe6396a639673f91737710f1";

const EnableEnvironmentModal = (props: Props) => {
  const { refetch, ...buttonProps } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const initialFocusRef = useRef(null);
  const cloudProviders = useCloudProvidersList({});
  const { fetchAuthed } = useAuth();

  return (
    <>
      <Button
        leftIcon={<AddIcon />}
        colorScheme="purple"
        onClick={onOpen}
        {...buttonProps}
      >
        Enable region
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
              image: `materialize/materialized:${ImageTag}`,
            }}
            onSubmit={async (values, actions) => {
              try {
                await fetchAuthed(
                  `${props.region.environmentControllerUrl}/api/environment`,
                  {
                    body: JSON.stringify({
                      coordd_image_ref: values.image,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    method: "POST",
                  }
                );
                await refetch();
                onClose();
                toast({
                  title: "Region enabled.",
                  status: "success",
                });
              } catch (e: any) {
                console.log(e);
                if (e.status === 400) {
                  actions.setErrors(e.data);
                }
              }
            }}
          >
            <Form>
              <ModalHeader>
                Enable region {props.region.provider}/{props.region.region}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pt="3" pb="6">
                <Box ref={initialFocusRef} tabIndex={-1} />
                <VStack spacing="5">
                  <TextField name="image" label="Image reference" size="sm" />
                </VStack>
              </ModalBody>
              <ModalFooter>
                <HStack>
                  <Button size="sm" onClick={onClose} variant="outline">
                    Cancel
                  </Button>
                  <SubmitButton size="sm">Enable</SubmitButton>
                </HStack>
              </ModalFooter>
            </Form>
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EnableEnvironmentModal;
