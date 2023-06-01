import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";

import createClusterReplicaStatement from "~/api/materialize/cluster/createClusterReplicaStatement";
import { duplicateReplicaName } from "~/api/materialize/parseErrors";
import useAvailableClusterSizes from "~/api/materialize/useAvailableClusterSizes";
import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import { useSqlLazy } from "~/api/materialized";
import InlayBanner from "~/components/InlayBanner";
import ObjectNameInput from "~/components/ObjectNameInput";
import SimpleSelect from "~/components/SimpleSelect";
import useSuccessToast from "~/components/SuccessToast";
import { MaterializeTheme } from "~/theme";

type FormState = {
  name: string;
  size: string;
};

const NewReplicaForm = ({
  clusterName,
  onClose,
  onSubmit,
}: {
  clusterName: string;
  onClose: () => void;
  onSubmit: () => void;
}) => {
  const [generalFormError, setGeneralFormError] = React.useState<
    string | undefined
  >(undefined);
  const toast = useSuccessToast();

  const {
    register,
    handleSubmit: handleSubmit,
    reset: formReset,
    formState,
    setError,
  } = useForm<FormState>({
    mode: "onTouched",
  });

  const { data: clusterSizes } = useAvailableClusterSizes();
  const { runSql: createReplica, loading: isCreationInFlight } = useSqlLazy({
    queryBuilder: createClusterReplicaStatement,
  });

  const handleValidSubmit = async (values: FormState) => {
    setGeneralFormError(undefined);
    createReplica(
      { ...values, clusterName },
      {
        onSuccess: () => {
          onSubmit();
          toast({
            description: "New replica created successfully",
          });
          formReset();
        },
        onError: (errorMessage) => {
          const objectName = duplicateReplicaName(errorMessage);
          if (objectName === values.name) {
            setError("name", {
              message:
                "A replica with that name already exists in this cluster.",
            });
          } else {
            setGeneralFormError(errorMessage);
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)}>
      <ModalHeader>Create Replica</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack pb={6} spacing="4">
          {generalFormError && (
            <InlayBanner
              variant="error"
              label="Error"
              message={generalFormError}
            />
          )}
          <FormControl isInvalid={!!formState.errors.name}>
            <FormLabel fontSize="sm">Name</FormLabel>
            <ObjectNameInput
              {...register("name", {
                required: "Name is required.",
                pattern: {
                  value: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                  message: "Name must not include special characters",
                },
              })}
              placeholder="Choose something descriptive"
              autoFocus
              autoCorrect="off"
              size="sm"
              variant={formState.errors.name ? "error" : "default"}
            />
            {!formState.errors.name && (
              <FormHelperText>
                Alphanumeric characters and underscores only.
              </FormHelperText>
            )}
            <FormErrorMessage>
              {formState.errors.name?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!formState.errors.size}>
            <FormLabel fontSize="sm">Size</FormLabel>
            {clusterSizes && (
              <SimpleSelect {...register("size" as const)}>
                {clusterSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </SimpleSelect>
            )}
            <FormErrorMessage>
              {formState.errors.size?.message}
            </FormErrorMessage>
          </FormControl>
        </VStack>
      </ModalBody>

      <ModalFooter>
        <HStack spacing="2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isDisabled={isCreationInFlight}
          >
            Create replica
          </Button>
        </HStack>
      </ModalFooter>
    </form>
  );
};

const NewReplicaModal = ({
  clusterName,
  isOpen,
  onClose,
  onSubmit,
}: {
  clusterName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) => {
  const { shadows } = useTheme<MaterializeTheme>();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent shadow={shadows.level4}>
        <NewReplicaForm
          clusterName={clusterName}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </ModalContent>
    </Modal>
  );
};

export default NewReplicaModal;
