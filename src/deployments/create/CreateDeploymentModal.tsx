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

import {
  Deployment,
  DeploymentSizeEnum,
  SupportedCloudRegionRequest,
  useCloudProvidersList,
  useDeploymentsCreate,
} from "../../api/api";
import {
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/formComponents";
import { petname } from "../../util";
import DeploymentSizeField from "../DeploymentSizeField";
import CloudProviderSelectField from "./CloudProviderSelect";
import RegionSelectField from "./RegionSelect";

interface Props extends ButtonProps {
  refetch: () => Promise<Deployment[] | null>;
}

const useCloudProviders = () => {
  const getCloudProvidersOperation = useCloudProvidersList({});

  return {
    getCloudProvidersOperation: getCloudProvidersOperation,
    cloudProviders: getCloudProvidersOperation.data,
  };
};

const CreateDeploymentModal = (props: Props) => {
  const { refetch, ...buttonProps } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate: createDeployment } = useDeploymentsCreate({});
  const toast = useToast();
  const initialFocusRef = useRef(null);
  const { getCloudProvidersOperation, cloudProviders } = useCloudProviders();

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
      >
        <ModalOverlay />
        <ModalContent>
          <Formik
            initialValues={{
              name: petname(),
              size: "XS" as DeploymentSizeEnum,
              cloudProviderRegion: cloudProviders
                ? cloudProviders[0]
                : ({
                    provider: "AWS",
                    region: "us-east-1",
                  } as SupportedCloudRegionRequest),
            }}
            onSubmit={async (values, actions) => {
              try {
                await createDeployment({
                  name: values.name,
                  size: values.size,
                  cloudProviderRegion: {
                    provider: values.cloudProviderRegion.provider,
                    region: values.cloudProviderRegion.region,
                  },
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
                    <CloudProviderSelectField
                      loading={getCloudProvidersOperation.loading}
                      cloudProviders={cloudProviders}
                    />
                    <RegionSelectField
                      loading={getCloudProvidersOperation.loading}
                      cloudProviders={cloudProviders}
                    />
                  </HStack>
                  <Alert status="info" fontSize="sm" variant="pale">
                    Additional cloud providers and regions coming soon.
                  </Alert>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <HStack>
                  <Button size="sm" onClick={onClose} variant="outline">
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
};

export default CreateDeploymentModal;
