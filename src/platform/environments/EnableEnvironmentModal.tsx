/**
 * @module
 * Enable environment modal.
 */

import { AddIcon } from "@chakra-ui/icons";
import {
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

import { useAuth } from "../../api/auth";
import { SupportedCloudRegion } from "../../api/backend";
import { SubmitButton, TextField } from "../../components/formComponents";

interface Props extends ButtonProps {
  refetch: () => Promise<any>;
  region: SupportedCloudRegion;
  isAdmin: boolean;
}

/// The image SHA that we spin up all new materialize platform
/// components up with by default.  You need to bump this to a new
/// value whenever you wish to try new materialized functions in
/// cloud.
// TODO: Use something like the release tracks we use for materialize cloud deployments.
const ImageTag = "unstable-9e66e0f86d019d6e2a7d4215cfd9d428ea2f815e";

const EnableEnvironmentModal = (props: Props) => {
  const { refetch, isAdmin, ...buttonProps } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const initialFocusRef = useRef(null);
  const { fetchAuthed } = useAuth();

  return (
    <>
      <Button
        leftIcon={<AddIcon />}
        colorScheme="purple"
        onClick={onOpen}
        {...buttonProps}
        disabled={!isAdmin}
        title={isAdmin ? "" : "Only admins can enable new regions."}
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
              image: `materialize/materialized-slim:${ImageTag}`,
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
