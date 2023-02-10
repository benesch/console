import {
  Alert,
  AlertDescription,
  BoxProps,
  Button,
  CloseButton,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import { IApiTokensData } from "@frontegg/redux-store";
import { format } from "date-fns";
import React from "react";
import { useForm } from "react-hook-form";

import DeleteKeyModal from "~/access/DeleteKeyModal";
import { useAuth } from "~/api/auth";
import { CopyButton } from "~/components/copyableComponents";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import { MaterializeTheme } from "~/theme";
import useAppPasswords from "~/useAppPasswords";

const AppPasswordsPage = () => {
  const [latestPassName, setLatestPassName] = React.useState("");
  const [latestDeletionId, setLatestDeletionId] = React.useState("");
  const {
    addUserApiToken,
    loadingInProgress,
    createInProgress,
    tokensState,
    newPassword,
  } = useAppPasswords();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { register, handleSubmit, formState, reset } = useForm<{
    name: string;
  }>({
    mode: "onTouched",
  });

  const deleteCb = (clientId: string) => {
    setLatestDeletionId(clientId);
    // if we're deleting the key we just made,
    // definitely don't show that key's creds anymore
    if (tokensState.successDialog.clientId === clientId) {
      setLatestPassName("");
    }
  };

  const closeSecretBox = () => {
    setLatestPassName("");
  };

  return (
    <>
      <PageHeader>
        <PageHeading>App passwords</PageHeading>
        <Button variant="primary" size="sm" onClick={onOpen}>
          New app password
        </Button>
      </PageHeader>
      {loadingInProgress ? (
        <Spinner data-testid="loading-spinner" />
      ) : (
        <VStack alignItems="stretch">
          {latestPassName && newPassword && (
            <SecretBox
              name={latestPassName}
              password={newPassword}
              onClose={closeSecretBox}
            />
          )}
          <PasswordsTable
            tokens={tokensState.apiTokensDataUser}
            latestDeletionId={latestDeletionId}
            deleteCb={deleteCb}
          />
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <form
                onSubmit={handleSubmit((data) => {
                  setLatestPassName(data.name);
                  addUserApiToken({ description: data.name });
                  reset();
                  onClose();
                })}
              >
                <ModalHeader>New app password</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack pb={6} spacing="4">
                    <Text fontSize="sm">
                      App passwords are used to authenticate connections to
                      Materialize.
                    </Text>
                    <FormControl isInvalid={!!formState.errors.name}>
                      <FormLabel htmlFor="name" fontSize="sm">
                        Name
                      </FormLabel>
                      <Input
                        {...register("name", {
                          required: "Name is required",
                        })}
                        placeholder="e.g. Personal laptop"
                        autoFocus={isOpen}
                        autoCorrect="off"
                        size="sm"
                      />
                      <FormErrorMessage>
                        {formState.errors.name?.message}
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
                      isDisabled={!!createInProgress}
                    >
                      Create Password
                    </Button>
                  </HStack>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        </VStack>
      )}
    </>
  );
};

type TableKey = IApiTokensData;

type APIKeysTableProps = BoxProps & {
  tokens: TableKey[];
  latestDeletionId: string;
  deleteCb: (id: string) => void;
};

const PasswordsTable = ({
  tokens,
  latestDeletionId,
  deleteCb,
  ...props
}: APIKeysTableProps) => {
  const { user } = useAuth();
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Table variant="standalone" {...props}>
      <Thead>
        <Tr>
          <Th width="50%">Name</Th>
          <Th>Owner</Th>
          <Th>Created</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {tokens.map((token) => {
          const isDeleting = token.clientId === latestDeletionId;
          return (
            <Tr
              key={token.clientId}
              textColor={
                isDeleting
                  ? colors.semanticColors.foreground.primary
                  : "default"
              }
              opacity={isDeleting ? 0.5 : 1}
              aria-label={token.description}
            >
              <Td
                borderBottomWidth="1px"
                borderBottomColor={colors.semanticColors.border.primary}
              >
                {" "}
                {token.description}
              </Td>
              <Td
                borderBottomWidth="1px"
                borderBottomColor={colors.semanticColors.border.primary}
              >
                {" "}
                {user.name}
              </Td>
              <Td
                borderBottomWidth="1px"
                borderBottomColor={colors.semanticColors.border.primary}
              >
                {" "}
                {format(new Date(token.createdAt), "yyyy/MM/dd")}
              </Td>
              <Td
                borderBottomWidth="1px"
                borderBottomColor={colors.semanticColors.border.primary}
              >
                <DeleteKeyModal
                  description={token.description}
                  clientId={token.clientId}
                  isDisabled={isDeleting}
                  deleteCb={deleteCb}
                />
              </Td>
            </Tr>
          );
        })}
        {tokens.length === 0 && (
          <Tr>
            <Td colSpan={4}>No app passwords yet.</Td>
          </Tr>
        )}
      </Tbody>
    </Table>
  );
};

type SecretBoxProps = {
  name: string;
  password: string;
  onClose: () => void;
};

const SecretBox = ({ name, password, onClose }: SecretBoxProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <Alert
      status="info"
      mb={2}
      size="sm"
      background={colors.semanticColors.background.info}
      borderRadius="md"
      borderWidth="1px"
      borderColor={colors.semanticColors.border.info}
    >
      <VStack alignItems="flex-start" width="100%">
        <AlertDescription width="100%" px={2}>
          <VStack alignItems="start">
            <Text fontSize="md" fontWeight="500">
              New password {`"${name}"`}:
            </Text>
            <HStack
              role="group"
              bg={colors.semanticColors.background.primary}
              borderWidth="1px"
              borderColor={colors.semanticColors.border.primary}
              borderRadius={4}
              px={2}
              py={1}
            >
              <Text fontWeight="400" aria-label="clientId">
                {password}
              </Text>
              <CopyButton
                contents={password || ""}
                top={0}
                right={0}
                position="relative"
                flex="0 0 auto"
              />
            </HStack>
          </VStack>
          <Text
            pt={1}
            fontSize="sm"
            color={colors.semanticColors.foreground.primary}
          >
            Write this down; you will not be able to see your app password again
            after you reload!
          </Text>
        </AlertDescription>
      </VStack>
      <CloseButton
        position="absolute"
        right={1}
        top={1}
        size="sm"
        color={colors.semanticColors.foreground.secondary}
        onClick={onClose}
      />
    </Alert>
  );
};

export default AppPasswordsPage;
