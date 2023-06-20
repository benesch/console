import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useTheme,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";

import { useSegment } from "~/analytics/segment";
import { deleteObjectQueryBuilder } from "~/api/materialize/buildDeletObjectStatement";
import useObjectDependencies from "~/api/materialize/useObjectDependencies";
import { useSqlLazy } from "~/api/materialized";
import { MaterializeTheme } from "~/theme";
import { pluralize } from "~/util";

import InlayBanner from "./InlayBanner";
import useSuccessToast from "./SuccessToast";

export interface DeleteObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  objectId: string;
  objectName: string;
  objectType: string;
}

const DeleteObjectModal = ({
  isOpen,
  onClose,
  onSuccess,
  objectId,
  objectName,
  objectType,
}: DeleteObjectModalProps) => {
  const {
    shadows,
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const toast = useSuccessToast();
  const { track } = useSegment();
  const [showError, setShowError] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const { register, handleSubmit, formState } = useForm<{
    objectName: string;
  }>({
    mode: "onTouched",
  });

  const { loading: dependencyCountLoading, results: dependencyCount } =
    useObjectDependencies(objectId);
  const { runSql: deleteObject, loading: isDeleting } = useSqlLazy({
    queryBuilder: deleteObjectQueryBuilder,
  });

  const handleDelete = () => {
    track("Delete object clicked", { name: objectName });
    setShowError(false);
    deleteObject(
      { objectName, objectType },
      {
        onSuccess: () => {
          onClose();
          onSuccess();
          toast({
            description: (
              <>
                <Text color={semanticColors.foreground.primary} as="span">
                  {objectName}{" "}
                </Text>
                deleted successfully
              </>
            ),
          });
        },
        onError: () => {
          setShowError(true);
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent shadow={shadows.level4}>
        <form onSubmit={handleSubmit(handleDelete)}>
          <ModalHeader>Delete {objectName}</ModalHeader>
          <ModalCloseButton />
          {dependencyCountLoading || dependencyCount === null ? (
            <>
              <ModalBody>
                <Flex width="100%" justifyContent="center">
                  <Spinner />
                </Flex>
              </ModalBody>
            </>
          ) : showConfirmation || dependencyCount === 0 ? (
            <>
              <ModalBody pb="6">
                {showError && (
                  <InlayBanner
                    variant="error"
                    label="Error"
                    message="There was an error deleting the object. Please try again."
                  />
                )}
                <FormControl isInvalid={!!formState.errors.objectName}>
                  <FormLabel>To confirm, type {objectName} below</FormLabel>
                  <Input
                    autoFocus
                    placeholder={objectName}
                    variant={formState.errors.objectName ? "error" : "default"}
                    {...register("objectName", {
                      required: "Object name is required.",
                      validate: (value) => {
                        if (value !== objectName) {
                          return "Object name must match exactly.";
                        }
                      },
                    })}
                  />
                  <FormErrorMessage>
                    {formState.errors.objectName?.message}
                  </FormErrorMessage>
                </FormControl>
                <Text
                  textStyle="text-base"
                  color={semanticColors.foreground.secondary}
                  mt="4"
                >
                  {dependencyCount === 0 ? (
                    <>
                      This action will permanently delete {objectName} and can
                      not be undone.
                    </>
                  ) : (
                    <>
                      This will permanently delete {objectName} and all sources,
                      materialized views, views, indexes, and sink that depend
                      on it.
                    </>
                  )}
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="submit"
                  colorScheme="red"
                  size="sm"
                  width="100%"
                  isDisabled={isDeleting}
                >
                  Delete Object
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalBody pb="10">
                {showError && (
                  <InlayBanner
                    variant="error"
                    label="Error"
                    message="There was an error deleting the object. Please try again."
                  />
                )}
                <InlayBanner
                  variant="warn"
                  message={`${objectName} has ${dependencyCount} ${pluralize(
                    dependencyCount,
                    "dependent",
                    "dependents"
                  )}`}
                />
                <Text
                  textStyle="text-base"
                  color={semanticColors.foreground.secondary}
                  mt="4"
                >
                  This {objectType.toLowerCase()} is used by other objects. In
                  order to delete {objectName}, all it’s dependents will be
                  deleted as well.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="secondary"
                  size="sm"
                  width="100%"
                  isDisabled={isDeleting}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConfirmation(true);
                  }}
                >
                  Yes, I am sure I want to delete all dependents
                </Button>
              </ModalFooter>
            </>
          )}
        </form>
      </ModalContent>
    </Modal>
  );
};

export default DeleteObjectModal;
