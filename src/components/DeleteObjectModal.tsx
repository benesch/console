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
  VStack,
} from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import React from "react";
import { useForm } from "react-hook-form";

import { useSegment } from "~/analytics/segment";
import {
  DeletableObjectType,
  deleteObjectQueryBuilder,
} from "~/api/materialize/buildDeletObjectStatement";
import { DatabaseObject } from "~/api/materialize/types";
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
  dbObject: DatabaseObject;
  objectType: DeletableObjectType;
}

const DeleteObjectModal = ({
  isOpen,
  onClose,
  onSuccess,
  dbObject,
  objectType,
}: DeleteObjectModalProps) => {
  const { shadows, colors } = useTheme<MaterializeTheme>();
  const toast = useSuccessToast();
  const { track } = useSegment();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const { register, handleSubmit, formState } = useForm<{
    objectName: string;
  }>({
    mode: "onTouched",
  });

  const { loading: dependencyCountLoading, results: dependencyCount } =
    useObjectDependencies(dbObject.id);
  const {
    runSql: deleteObject,
    loading: isDeleting,
    error,
  } = useSqlLazy({
    queryBuilder: deleteObjectQueryBuilder,
  });

  const handleDelete = () => {
    track("Delete object clicked", { name: dbObject.name });
    deleteObject(
      { dbObject, objectType },
      {
        onSuccess: () => {
          onClose();
          onSuccess();
          toast({
            description: (
              <>
                <Text color={colors.foreground.primary} as="span">
                  {dbObject.name}{" "}
                </Text>
                deleted successfully
              </>
            ),
          });
        },
        onError: (message) => {
          Sentry.captureException(new Error("Delete object error: " + message));
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent shadow={shadows.level4}>
        <form onSubmit={handleSubmit(handleDelete)}>
          <ModalHeader
            p="4"
            borderBottom={`1px solid ${colors.border.primary}`}
          >
            Delete {dbObject.name}
          </ModalHeader>
          <ModalCloseButton />
          {dependencyCountLoading || dependencyCount === null ? (
            <>
              <ModalBody>
                <Flex width="100%" justifyContent="center">
                  <Spinner />
                </Flex>
              </ModalBody>
            </>
          ) : showConfirmation ||
            objectType === "CLUSTER REPLICA" ||
            dependencyCount === 0 ? (
            <>
              <ModalBody pb="6">
                <VStack spacing="4" width="100%">
                  {error && (
                    <InlayBanner
                      variant="error"
                      label="Error"
                      message="There was an error deleting the object. Please try again."
                    />
                  )}
                  <FormControl isInvalid={!!formState.errors.objectName}>
                    <FormLabel>
                      To confirm, type {dbObject.name} below
                    </FormLabel>
                    <Input
                      autoFocus
                      placeholder={dbObject.name}
                      variant={
                        formState.errors.objectName ? "error" : "default"
                      }
                      {...register("objectName", {
                        required: "Object name is required.",
                        validate: (value) => {
                          if (value !== dbObject.name) {
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
                    color={colors.foreground.secondary}
                  >
                    {dependencyCount === 0 ? (
                      <>
                        This action will permanently delete {dbObject.name} and
                        can not be undone.
                      </>
                    ) : (
                      <>
                        This will permanently delete {dbObject.name} and all
                        sources, materialized views, views, indexes, and sinks
                        that depend on it.
                      </>
                    )}
                  </Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="submit"
                  colorScheme="red"
                  size="sm"
                  width="100%"
                  isDisabled={isDeleting}
                >
                  Drop {objectType.toLowerCase()}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalBody pb="10">
                <VStack spacing="4">
                  <InlayBanner
                    width="100%"
                    variant="warn"
                    textStyle="text-ui-med"
                    message={`${
                      dbObject.name
                    } has ${dependencyCount} ${pluralize(
                      dependencyCount,
                      "dependent",
                      "dependents"
                    )}`}
                  />
                  <Text
                    textStyle="text-base"
                    color={colors.foreground.secondary}
                  >
                    This {objectType.toLowerCase()} is used by other objects. In
                    order to delete {dbObject.name}, all its dependents will be
                    deleted as well.
                  </Text>
                </VStack>
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
